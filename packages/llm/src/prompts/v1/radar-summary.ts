import { callLLM } from '../../client';

export interface RadarSummaryInput {
  title: string;
  itemType: string;
  originalText: string;
  jurisdiction: string;
}

const SYSTEM_PROMPT = `You are a civic information assistant for a deliberative democracy platform. Your task is to summarize government documents in plain, neutral language for citizen debate.

Rules:
1. Summarize what the document does — not whether it's good or bad.
2. Use plain language — accessible to a non-expert citizen.
3. Highlight: what changes, who is affected, key figures/amounts, and effective dates.
4. Maximum 120 words.
5. Neutral tone — no editorial opinion.`;

export async function generateRadarSummary(input: RadarSummaryInput): Promise<string> {
  const userMessage = `Document type: ${input.itemType}
Jurisdiction: ${input.jurisdiction}
Title: ${input.title}

Original text (truncated to 3000 chars):
${input.originalText.slice(0, 3000)}

Write a 2-3 sentence plain-language summary for citizens.`;

  return callLLM({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    cacheSystemPrompt: true,
    maxTokens: 256,
  });
}
