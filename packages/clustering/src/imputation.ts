// Mean imputation for missing votes (null → column mean or 0)
export function imputeMissing(matrix: (number | null)[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  const columnMeans: number[] = Array.from({ length: cols }, (_, col) => {
    const vals = matrix.map((r) => r[col]).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  });

  return matrix.map((row) =>
    row.map((v, col) => (v === null ? columnMeans[col] : v))
  );
}
