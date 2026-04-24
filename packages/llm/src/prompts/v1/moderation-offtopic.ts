import { callLLM } from '../../client';

export interface ModerationInput {
  threadTitle: string;
  forumTopic: string;
  content: string;
  contentType: 'thread' | 'comment';
}

export interface ModerationResult {
  isOfftopic: boolean;
  confidence: number;
  reason: string;
}

const SYSTEM_PROMPT = `You are a permissive moderation assistant for a civic deliberation platform.

Rules:
1. Flag content as off-topic ONLY if it is clearly unrelated to the forum or thread topic.
2. Do NOT flag content for tone, controversy, emotional language, or unpopular opinions.
3. Political disagreement is NOT off-topic.
4. Personal attacks are off-topic only if they contain NO policy content.
5. When in doubt, return isOfftopic: false (fail-open).
6. Return valid JSON only.`;

export async function classifyOfftopic(input: ModerationInput): Promise<ModerationResult> {
  const userMessage = `Forum topic: ${input.forumTopic}
Thread title: ${input.threadTitle}
Content type: ${input.contentType}
Content: ${input.content.slice(0, 1000)}

Is this content off-topic? Return JSON: {"isOfftopic": boolean, "confidence": 0.0-1.0, "reason": "..."}`;

  try {
    const raw = await callLLM({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      cacheSystemPrompt: true,
      maxTokens: 128,
      temperature: 0,
    });
    return JSON.parse(raw) as ModerationResult;
  } catch {
    // Fail-open: if LLM fails, do not mark as off-topic
    return { isOfftopic: false, confidence: 0, reason: 'moderation_api_error' };
  }
}
