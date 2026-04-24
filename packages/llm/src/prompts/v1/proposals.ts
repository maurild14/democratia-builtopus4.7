import { callLLM } from '../../client';

export interface ProposalInput {
  threadTitle: string;
  forumTopic: string;
  synthesis: string;
  consensusStatements: string[];
  geoLevel: string;
  jurisdiction: string;
}

export interface Proposal {
  title: string;
  description: string;
  rationale: string;
  addressee: string;
  consensusSupport: number;
}

const SYSTEM_PROMPT = `You are a civic policy assistant for a deliberative democracy platform. Your task is to convert deliberative results into actionable policy proposals.

Rules:
1. Proposals must reflect actual consensus from the data — do not invent positions.
2. Each proposal must name the appropriate government body/addressee.
3. Write in formal but plain language suitable for a policy memo.
4. Include only 3-5 proposals.
5. Return valid JSON only.`;

export async function generateProposals(input: ProposalInput): Promise<Proposal[]> {
  const userMessage = `Forum topic: ${input.forumTopic}
Thread: ${input.threadTitle}
Jurisdiction: ${input.jurisdiction} (level: ${input.geoLevel})

Synthesis of deliberation:
${input.synthesis}

Consensus statements:
${input.consensusStatements.map((s) => `- ${s}`).join('\n')}

Generate 3-5 actionable policy proposals. Return JSON: {"proposals": [{"title": "...", "description": "...", "rationale": "...", "addressee": "...", "consensusSupport": 0.0-1.0}]}`;

  const raw = await callLLM({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    cacheSystemPrompt: true,
    maxTokens: 1024,
  });

  const parsed = JSON.parse(raw) as { proposals: Proposal[] };
  return parsed.proposals.slice(0, 5);
}
