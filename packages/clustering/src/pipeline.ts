import type { VoteMatrix, ClusteringPipelineResult } from './types';
import { imputeMissing } from './imputation';
import { computePCA } from './pca';
import { findOptimalK } from './kmeans';
import { analyzeConsensus } from './consensus';

export function runClusteringPipeline(matrix: VoteMatrix): ClusteringPipelineResult {
  const { userIds, statementIds, values, weights } = matrix;

  if (userIds.length < 4) {
    throw new Error(`Insufficient participants for clustering: ${userIds.length}`);
  }

  const imputed = imputeMissing(values);
  const pcaResult = computePCA(imputed);
  const clusterResult = findOptimalK(pcaResult.coordinates);
  const statementAnalysis = analyzeConsensus(matrix, clusterResult);

  const consensusStatements = statementAnalysis
    .filter((s) => s.isConsensus)
    .sort((a, b) => b.consensusScore - a.consensusScore)
    .map((s) => s.statementId);

  const divisiveStatements = statementAnalysis
    .filter((s) => s.isDivisive && !s.isConsensus)
    .sort((a, b) => {
      const spreadA = Math.max(...a.agreeRatePerCluster) - Math.min(...a.agreeRatePerCluster);
      const spreadB = Math.max(...b.agreeRatePerCluster) - Math.min(...b.agreeRatePerCluster);
      return spreadB - spreadA;
    })
    .map((s) => s.statementId);

  return {
    clusterResult,
    pcaResult,
    consensusStatements,
    divisiveStatements,
    statementAnalysis,
    participantCount: userIds.length,
  };
}
