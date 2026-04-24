import { callLLM } from '../../client';

export interface ExtractStatementsInput {
  threadTitle: string;
  threadBody: string;
  comments: string[];
  forumTopic: string;
}

export interface ExtractedStatement {
  text: string;
  rationale: string;
}

const SYSTEM_PROMPT = `You are a neutral facilitator for a deliberative democracy platform. Your task is to extract clear, votable position statements from civic discussions.

Rules:
1. Extract 5-12 distinct statements that capture the main positions expressed in the discussion.
2. Each statement must be neutral in framing — no editorializing, no invented positions.
3. Statements must be falsifiable or clearly opinionated ("The city should...", "Public transit funding should...").
4. Do not merge conflicting positions — preserve both sides as separate statements.
5. Do not erase minority voices — if only one person expressed a position, it still deserves a statement.
6. Statements should be 10-100 words each, clear enough for a non-expert to vote on.
7. Return valid JSON only — no commentary before or after.`;

export async function extractStatements(input: ExtractStatementsInput): Promise<ExtractedStatement[]> {
  const userMessage = `Forum topic: ${input.forumTopic}
Thread title: ${input.threadTitle}
Thread body: ${input.threadBody}

Comments (${input.comments.length} total):
${input.comments.slice(0, 50).map((c, i) => `[${i + 1}] ${c}`).join('\n')}

Extract position statements from this discussion. Return JSON: {"statements": [{"text": "...", "rationale": "..."}]}`;

  const raw = await callLLM({
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    cacheSystemPrompt: true,
  });

  const parsed = JSON.parse(raw) as { statements: ExtractedStatement[] };
  return parsed.statements.slice(0, 12);
}
