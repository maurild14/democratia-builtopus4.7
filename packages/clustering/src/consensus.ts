import { CONSENSUS_AGREEMENT_THRESHOLD, DIVISIVE_SPREAD_THRESHOLD } from '@democratia/config';
import type { VoteMatrix, ConsensusAnalysis, ClusterResult } from './types';

export function analyzeConsensus(
  matrix: VoteMatrix,
  clusterResult: ClusterResult
): ConsensusAnalysis[] {
  const { statementIds, values, weights } = matrix;
  const { assignments, k } = clusterResult;

  return statementIds.map((statementId, stmtIdx) => {
    // Weighted agree rate per cluster
    const agreeRatePerCluster: number[] = Array.from({ length: k }, (_, ci) => {
      let weightedAgree = 0, totalWeight = 0;
      assignments.forEach((cluster, userIdx) => {
        if (cluster !== ci) return;
        const vote = values[userIdx][stmtIdx];
        const w = weights[userIdx];
        if (vote !== null && vote !== 0) {
          weightedAgree += vote === 1 ? w : 0;
          totalWeight += w;
        }
      });
      return totalWeight > 0 ? weightedAgree / totalWeight : 0.5;
    });

    const minRate = Math.min(...agreeRatePerCluster);
    const maxRate = Math.max(...agreeRatePerCluster);

    // Overall weighted agree rate
    let globalWeightedAgree = 0, globalWeight = 0;
    values.forEach((row, userIdx) => {
      const vote = row[stmtIdx];
      const w = weights[userIdx];
      if (vote !== null && vote !== 0) {
        globalWeightedAgree += vote === 1 ? w : 0;
        globalWeight += w;
      }
    });
    const consensusScore = globalWeight > 0 ? globalWeightedAgree / globalWeight : 0.5;

    const isConsensus = minRate >= CONSENSUS_AGREEMENT_THRESHOLD;
    const isDivisive = maxRate - minRate >= DIVISIVE_SPREAD_THRESHOLD;

    return { statementId, isConsensus, isDivisive, consensusScore, agreeRatePerCluster };
  });
}
