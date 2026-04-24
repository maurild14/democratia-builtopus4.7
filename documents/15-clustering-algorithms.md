# 15 — Clustering (Layer 3)

All clustering code lives in `packages/clustering/`. Pure TypeScript, one dependency (`ml-matrix`). No React, no Next.js, no Supabase. This allows a data-science contributor to work on algorithms in isolation.

## Full pipeline

```
Vote matrix (N users × M statements)
    │   Values: +1 (agree), -1 (disagree), 0 (pass), null (not voted)
    │
    ▼
Missing-data imputation
    │   null → 0 (implicit pass). Pol.is strategy.
    │   Filter users who voted <50% of statements.
    │
    ▼
PCA (2D reduction)
    │   ONLY for visualization (scatter plot).
    │   Clustering is NOT done on PCA's 2D output.
    │
    ▼
Optimal-K selection
    │   Silhouette score for K=2..min(8, N/3).
    │   Parsimony: if two K values have similar silhouette (Δ<0.05), prefer smaller.
    │   If best silhouette < 0.2 → K=1 (no significant clusters).
    │
    ▼
K-Means clustering
    │   Run on the COMPLETE matrix (M dimensions), NOT on 2D.
    │   Initialization: K-Means++ (spaced centroids).
    │   Deterministic seed derived from thread_id (reproducible).
    │
    ▼
Consensus and division detection
    │   Strong consensus: ≥75% of clusters have >60% agree.
    │   Moderate consensus: ≥50% of clusters have >60% agree (and none >60% disagree).
    │   Divisive: at least 1 cluster >60% agree AND at least 1 cluster >60% disagree.
    │   Neutral: no clear pattern.
    │   Percentages are weighted by the user's geographic weight.
    │
    ▼
Cluster description (LLM)
    │   Claude generates label (≤30 chars) and description (≤200 chars) per cluster.
    │   Based on voting profile, not demographics.
    │   Never uses political labels (left/right/progressive/conservative).
    │
    ▼
Visualization data → Frontend
```

## Critical principle — PCA vs. clustering

PCA is used **only** to produce the 2D scatter-plot coordinates. **Clustering runs on the full M-dimensional space** (M = number of statements).

If we clustered on the 2 PCA components, we would risk merging clusters that are distinguishable in higher dimensions. PCA can lose information relevant to separating clusters.

## Vote-matrix construction

SQL query fetches all `type='statement'` votes for the deliberating thread and pivots into a matrix where each row is a user and each column is a statement. Values are +1, -1, 0, or null.

Before processing, users who voted **<50% of statements are filtered out** — they don't provide enough signal to confidently place them in a cluster.

## Missing-data handling

`null` values are replaced with `0` (implicit pass). Rationale: most neutral (no bias toward any position), the same strategy Pol.is uses, simplest to implement. Alternatives rejected: eliminating users with missing data (loses participants), imputing by statement mean (biases toward majority), imputing by user mean (assumes user would vote like their average).

## PCA

Implemented with `ml-matrix` (linear algebra in TypeScript). Steps: center data (subtract column mean), compute covariance matrix, eigenvalue decomposition, take top 2 principal components, project to 2D, normalize coordinates to [-1, 1].

Output: `(x, y)` coordinates per user for the scatter plot, plus variance-explained percentages per component (for metadata).

**UX note:** Scatter-plot axes have **no labels.** Do not say "Left = pro-pedestrianization." That would be a potentially wrong interpretation. The scatter plot shows proximity/distance between users, not absolute positions.

## K-Means with K-Means++

K-Means chosen for simplicity, interpretability, speed at pilot volume (N<5000), and validated Pol.is precedent.

**K-Means++** for centroid initialization: instead of random, the first centroid is random and subsequent ones are chosen with probability proportional to squared distance from the nearest existing centroid. Produces more stable clusters and reduces iterations to convergence.

**Deterministic seed:** `thread_id` hash is the RNG seed. Re-executing clustering on the same data yields the same result.

Implemented from scratch in `packages/clustering/src/kmeans.ts` (<100 lines). More transparent and testable than a black-box library.

## Optimal-K selection

Test K from 2 to `min(8, floor(N/3))` — max 8 clusters (harder to interpret for citizens), min 3 users per cluster.

For each K, run K-Means and compute average silhouette score. Silhouette measures how well each point fits its cluster vs. neighboring clusters (range −1 to +1, higher is better).

**Parsimony principle:** If K=2 gives silhouette 0.45 and K=4 gives 0.48 (diff <0.05), choose K=2. Fewer clusters are easier to interpret.

**Special case K=1:** If all silhouette scores are <0.2, no significant cluster structure exists. The debate is homogeneous. Return K=1 with the message "The community shows relatively uniform opinions on this topic."

## Consensus and division detection

For each statement, compute vote distribution per cluster, **weighted by users' geographic weight.**

| Condition | Classification |
|---|---|
| ≥75% of clusters have >60% agree AND none >60% disagree | **Strong consensus** |
| 50–74% of clusters have >60% agree AND none >60% disagree | **Moderate consensus** |
| ≥1 cluster >60% agree AND ≥1 cluster >60% disagree | **Divisive** |
| No clear pattern | **Neutral** |

Compute a **polarization index** (0–1) for divisive statements based on variance of agreement percentages across clusters. Higher variance = higher polarization.

## Clustering trigger

Clustering runs when any of these conditions is met:

1. **Sufficient participation:** ≥10 qualified voters (voted ≥50% of statements) AND ≥60% of those who voted any statement are qualified.
2. **Timeout:** 7 days since Layer 2 began, with at least 10 qualified voters.

Checked every hour by a Vercel Cron Job.

## No re-clustering

Once Layer 3 runs, results are **final.** No re-clustering with new votes.

Reasons: re-clustering would change clusters users already saw (confusion), reports would lose integrity, Layer 4 synthesis is based on a fixed snapshot. Post-clustering votes appear as additional data in Layer 5 but do not alter results.

## Edge cases

- **N < 10 qualified participants:** Do not run clustering. Show simple aggregate results.
- **M < 3 statements:** Do not run clustering. PCA needs ≥2 dimensions with variability.
- **Homogeneous voting (silhouette < 0.2):** K=1, all statements >60% agree → consensuses.
- **High polarization (K=2, silhouette > 0.7):** Flag `high_polarization=true`; synthesis emphasizes search for nuance.
- **Very small cluster (<3 people):** Merge with nearest cluster by centroid distance. Reason: k-anonymity.

## Performance

For pilot volume (N<5000, M<25): PCA + K-Means in <1 second. Post-pilot, if N>50,000, migrate to a Python worker with scikit-learn.

## Frontend data payload

```typescript
{
  points: [{ userId, x, y, clusterId }],
  clusters: [{ id, label, description, memberCount, percentage, color }],
  explainedVariance: { pc1, pc2, total },
  totalParticipants, totalStatements, clusteringQuality
}
```

**Fixed color palette (WCAG AA):** `#3B82F6` (blue), `#EF4444` (red), `#10B981` (emerald), `#F59E0B` (amber), `#8B5CF6` (violet), `#EC4899` (pink), `#06B6D4` (cyan), `#F97316` (orange).
