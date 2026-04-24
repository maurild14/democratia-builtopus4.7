// Simple 2D PCA via covariance matrix SVD approximation (power iteration)
export function computePCA(data: number[][]): { coordinates: number[][]; explainedVariance: number } {
  const n = data.length;
  const d = data[0]?.length ?? 0;
  if (n === 0 || d === 0) return { coordinates: [], explainedVariance: 0 };

  // Center data
  const means = Array.from({ length: d }, (_, j) =>
    data.reduce((s, r) => s + r[j], 0) / n
  );
  const centered = data.map((r) => r.map((v, j) => v - means[j]));

  // Power iteration for top-2 eigenvectors
  function powerIterate(mat: number[][], v: number[]): number[] {
    for (let iter = 0; iter < 50; iter++) {
      const newV = mat.map((row) => row.reduce((s, val, j) => s + val * v[j], 0));
      const norm = Math.sqrt(newV.reduce((s, x) => s + x * x, 0)) || 1;
      v = newV.map((x) => x / norm);
    }
    return v;
  }

  // Build X^T X
  const xtx: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  for (const row of centered) {
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        xtx[i][j] += row[i] * row[j];
      }
    }
  }

  const initialV1 = Array.from({ length: d }, () => Math.random() - 0.5);
  const pc1 = powerIterate(xtx, initialV1);

  // Deflate
  const deflated = xtx.map((row, i) =>
    row.map((val, j) => {
      const lambda = row.reduce((s, v, k) => s + v * pc1[k], 0);
      return val - lambda * pc1[j];
    })
  );
  const initialV2 = Array.from({ length: d }, () => Math.random() - 0.5);
  const pc2 = powerIterate(deflated, initialV2);

  // Project
  const coordinates = centered.map((row) => [
    row.reduce((s, v, j) => s + v * pc1[j], 0),
    row.reduce((s, v, j) => s + v * pc2[j], 0),
  ]);

  const totalVar = xtx.reduce((s, row, i) => s + row[i], 0) || 1;
  const var1 = pc1.reduce((s, v, i) => s + xtx[i].reduce((ss, val, j) => ss + val * pc1[j], 0) * v, 0);
  const var2 = pc2.reduce((s, v, i) => s + deflated[i].reduce((ss, val, j) => ss + val * pc2[j], 0) * v, 0);
  const explainedVariance = Math.min(1, (var1 + var2) / totalVar);

  return { coordinates, explainedVariance };
}
