// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — OpenAI Provider (native SDK)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import OpenAI from 'openai';
import type {
  ProviderInstance,
  ProviderConfig,
  ProviderResponse,
  Message,
  ChatOptions,
  StreamChunk,
  ModelInfo,
  TokenUsage,
} from '../types.js';
import { PROVIDER_DEFAULTS } from '../types.js';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractTokenUsage(usage: OpenAI.CompletionUsage | null | undefined): TokenUsage | undefined {
  if (!usage) return undefined;
  return {
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    total_tokens: usage.total_tokens,
  };
}

export class OpenAIProvider implements ProviderInstance {
  readonly name: string;
  readonly config: ProviderConfig;
  private client: OpenAI;

  constructor(config?: Partial<ProviderConfig> & { apiKey?: string }) {
    const defaults = PROVIDER_DEFAULTS.openai;
    this.config = {
      name: defaults.name,
      baseUrl: config?.baseUrl ?? defaults.baseUrl,
      apiKey: config?.apiKey ?? '',
      models: defaults.models,
      isLocal: defaults.isLocal,
    };
    this.name = this.config.name;
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  // ── Validation ────────────────────────────────────

  validateConfig(): boolean {
    return this.config.apiKey.length > 0;
  }

  // ── Non-streaming chat ────────────────────────────

  async chat(messages: Message[], options: ChatOptions): Promise<ProviderResponse> {
    if (!this.validateConfig()) {
      throw new Error('OpenAI provider requires an API key. Set it via /key or the OPENAI_API_KEY env var.');
    }

    const systemPrompt = options.systemPrompt ?? '';
    const apiMessages: OpenAI.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this._resolveModel(),
          messages: apiMessages,
          temperature: options.temperature ?? 0.7,
          top_p: options.topP ?? 1.0,
          max_tokens: options.maxTokens ?? 4096,
          stream: false,
        });

        const choice = response.choices[0];
        return {
          content: choice?.message?.content ?? '',
          tokens: extractTokenUsage(response.usage),
          model: response.model,
        };
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number }).status;

        if (status === 429 || (status !== undefined && status >= 500)) {
          if (attempt < MAX_RETRIES - 1) {
            const wait = BASE_DELAY_MS * Math.pow(2, attempt);
            await delay(wait);
            continue;
          }
        }

        throw new Error(
          `OpenAI API error: ${(err as Error).message ?? String(err)}`,
        );
      }
    }

    throw new Error(
      `OpenAI request failed after ${MAX_RETRIES} retries: ${(lastError as Error).message ?? String(lastError)}`,
    );
  }

  // ── Streaming chat ────────────────────────────────

  async *stream(messages: Message[], options: ChatOptions): AsyncIterable<StreamChunk> {
    if (!this.validateConfig()) {
      throw new Error('OpenAI provider requires an API key. Set it via /key or the OPENAI_API_KEY env var.');
    }

    const systemPrompt = options.systemPrompt ?? '';
    const apiMessages: OpenAI.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      apiMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const stream = await this.client.chat.completions.create({
          model: this._resolveModel(),
          messages: apiMessages,
          temperature: options.temperature ?? 0.7,
          top_p: options.topP ?? 1.0,
          max_tokens: options.maxTokens ?? 4096,
          stream: true,
        });

        let usage: TokenUsage | undefined;

        for await (const chunk of stream) {
          usage = extractTokenUsage(chunk.usage);

          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            yield { content: delta, done: false, tokens: usage };
          }

          if (chunk.choices[0]?.finish_reason === 'stop') {
            yield { content: '', done: true, tokens: usage };
          }
        }

        return;
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number }).status;

        if (status === 429 || (status !== undefined && status >= 500)) {
          if (attempt < MAX_RETRIES - 1) {
            const wait = BASE_DELAY_MS * Math.pow(2, attempt);
            await delay(wait);
            continue;
          }
        }

        throw new Error(
          `OpenAI stream error: ${(err as Error).message ?? String(err)}`,
        );
      }
    }

    throw new Error(
      `OpenAI stream failed after ${MAX_RETRIES} retries: ${(lastError as Error).message ?? String(lastError)}`,
    );
  }

  // ── Models ────────────────────────────────────────

  async listModels(): Promise<ModelInfo[]> {
    return this.config.models;
  }

  // ── Connection test ───────────────────────────────

  async testConnection(): Promise<boolean> {
    if (!this.validateConfig()) return false;

    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  // ── Helpers ───────────────────────────────────────

  private _resolveModel(): string {
    return this.config.models[0]?.id ?? 'gpt-4o';
  }
}
