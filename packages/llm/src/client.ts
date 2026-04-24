import Anthropic from '@anthropic-ai/sdk';
import { LLM_MODEL, LLM_MAX_TOKENS, LLM_TEMPERATURE } from '@democratia/config';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export interface LLMCallOptions {
  system?: string;
  messages: Anthropic.Messages.MessageParam[];
  maxTokens?: number;
  temperature?: number;
  cacheSystemPrompt?: boolean;
}

export async function callLLM(options: LLMCallOptions): Promise<string> {
  const sdk = getAnthropicClient();
  const { system, messages, maxTokens = LLM_MAX_TOKENS, temperature = LLM_TEMPERATURE, cacheSystemPrompt = false } = options;

  const systemParam: Anthropic.Messages.MessageCreateParamsNonStreaming['system'] = system
    ? cacheSystemPrompt
      ? [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }]
      : system
    : undefined;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await sdk.messages.create({
        model: LLM_MODEL,
        max_tokens: maxTokens,
        temperature,
        ...(systemParam ? { system: systemParam } : {}),
        messages,
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('No text in LLM response');
      return textBlock.text;
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error('LLM call failed after 3 attempts');
}
