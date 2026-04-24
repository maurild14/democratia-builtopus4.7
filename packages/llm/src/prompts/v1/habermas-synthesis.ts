import { callLLM } from '../../client';

export interface ClusterSummary {
  clusterId: number;
  label: string;
  size: number;
  topStatements: string[];
  isConsensus: boolean;
}

export interface SynthesisInput {
  threadTitle: string;
  forumTopic: string;
  totalParticipants: number;
  clusters: ClusterSummary[];
  consensusStatements: string[];
  divisiveStatements: string[];
}

export interface SynthesisOutput {
  synthesis: string;
  dissentingVoices: string;
  executiveSummary: string;
}

const SYSTEM_PROMPT = `You are a Habermasian facilitator for a deliberative democracy platform. Your task is to synthesize civic deliberation results into an inclusive summary.

Rules:
1. Represent ALL clusters fairly, proportional to their size — do not favor majority positions.
2. Explicitly name and preserve minority positions — never erase dissent.
3. Distinguish: areas of genuine consensus, areas of controversy, and positions with no consensus.
4. Write in plain civic language — accessible to all citizens.
5. Do not editorialize or add positions not present in the data.
6. The dissenting voices section must be at least as prominent as the consensus section.
7. Return valid JSON only.`;

export async function synthesizeDeliberation(input: SynthesisInput): Promise<SynthesisOutput> {
  const userMessage = `Deliberation results for: "${input.threadTitle}" (Forum: ${input.forumTopic})
Total participants: ${input.totalParticipants}

Opinion clusters:
${input.clusters.map((c) => `- Cluster ${c.clusterId} (${c.size} participants, ${c.isConsensus ? 'CONSENSUS' : 'DIVERGENT'}): ${c.label}
  Key positions: ${c.topStatements.join('; ')}`).join('\n')}

Statements with broad consensus:
${input.consensusStatements.map((s) => `- ${s}`).join('\n')}

Divisive statements:
${input.divisiveStatements.map((s) => `- ${s}`).join('\n')}

Produce a Habermasian synthesis. Return JSON: {"synthesis": "...", "dissentingVoices": "...", "executiveSummary": "..."}`;

  const raw = await callLLM({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    cacheSystemPrompt: true,
    maxTokens: 2048,
  });

  return JSON.parse(raw) as SynthesisOutput;
}
