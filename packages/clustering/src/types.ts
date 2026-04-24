export interface VoteMatrix {
  userIds: string[];
  statementIds: string[];
  values: (number | null)[][];  // -1=disagree, 0=pass, 1=agree, null=no vote
  weights: number[];             // geographic weight per user
}

export interface ClusterResult {
  k: number;
  assignments: number[];     // cluster assignment per user
  centroids: number[][];     // k centroids in PCA space
  silhouetteScore: number;
  inertia: number;
}

export interface PCAResult {
  coordinates: number[][];   // 2D projection per user
  explainedVariance: number;
}

export interface ConsensusAnalysis {
  statementId: string;
  isConsensus: boolean;
  isDivisive: boolean;
  consensusScore: number;    // 0-1, higher = more agreement
  agreeRatePerCluster: number[];
}

export interface ClusteringPipelineResult {
  clusterResult: ClusterResult;
  pcaResult: PCAResult;
  consensusStatements: string[];
  divisiveStatements: string[];
  statementAnalysis: ConsensusAnalysis[];
  participantCount: number;
}
