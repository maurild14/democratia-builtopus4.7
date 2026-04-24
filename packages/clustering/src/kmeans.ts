import { CLUSTER_K_MIN, CLUSTER_K_MAX } from '@democratia/config';
import type { ClusterResult } from './types';

function distance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}

// K-Means++ initialization
function initCentroids(data: number[][], k: number): number[][] {
  const centroids: number[][] = [data[Math.floor(Math.random() * data.length)]];
  while (centroids.length < k) {
    const dists = data.map((p) => Math.min(...centroids.map((c) => distance(p, c) ** 2)));
    const total = dists.reduce((s, d) => s + d, 0);
    const r = Math.random() * total;
    let cumulative = 0;
    for (let i = 0; i < data.length; i++) {
      cumulative += dists[i];
      if (cumulative >= r) { centroids.push(data[i]); break; }
    }
  }
  return centroids;
}

export function kMeans(data: number[][], k: number, maxIter = 100): ClusterResult {
  let centroids = initCentroids(data, k);
  let assignments: number[] = new Array(data.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssignments = data.map((p) => {
      let minDist = Infinity, best = 0;
      centroids.forEach((c, i) => { const d = distance(p, c); if (d < minDist) { minDist = d; best = i; } });
      return best;
    });

    const changed = newAssignments.some((a, i) => a !== assignments[i]);
    assignments = newAssignments;

    if (!changed) break;

    // Update centroids
    const dim = data[0]?.length ?? 0;
    centroids = Array.from({ length: k }, (_, ci) => {
      const members = data.filter((_, i) => assignments[i] === ci);
      if (members.length === 0) return centroids[ci];
      return Array.from({ length: dim }, (__, j) =>
        members.reduce((s, p) => s + p[j], 0) / members.length
      );
    });
  }

  const inertia = data.reduce((s, p, i) => s + distance(p, centroids[assignments[i]]) ** 2, 0);
  const silhouetteScore = computeSilhouette(data, assignments, k);

  return { k, assignments, centroids, silhouetteScore, inertia };
}

function computeSilhouette(data: number[][], assignments: number[], k: number): number {
  if (data.length < 4 || k < 2) return 0;
  const scores = data.map((p, i) => {
    const ci = assignments[i];
    const sameCluster = data.filter((_, j) => j !== i && assignments[j] === ci);
    const a = sameCluster.length > 0
      ? sameCluster.reduce((s, q) => s + distance(p, q), 0) / sameCluster.length
      : 0;

    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === ci) continue;
      const otherCluster = data.filter((_, j) => assignments[j] === c);
      if (otherCluster.length === 0) continue;
      const avgDist = otherCluster.reduce((s, q) => s + distance(p, q), 0) / otherCluster.length;
      if (avgDist < b) b = avgDist;
    }

    if (b === Infinity) return 0;
    return (b - a) / Math.max(a, b);
  });
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

// Run K-Means for k in [K_MIN, K_MAX] and pick best by silhouette
export function findOptimalK(data: number[][]): ClusterResult {
  if (data.length < CLUSTER_K_MIN * 2) return kMeans(data, CLUSTER_K_MIN);

  let best: ClusterResult | null = null;
  const maxK = Math.min(CLUSTER_K_MAX, Math.floor(data.length / 2));

  for (let k = CLUSTER_K_MIN; k <= maxK; k++) {
    const result = kMeans(data, k);
    if (!best || result.silhouetteScore > best.silhouetteScore) best = result;
  }

  return best ?? kMeans(data, CLUSTER_K_MIN);
}
