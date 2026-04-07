// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Ollama Provider (local inference)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Ollama } from 'ollama';
import type { Message as OllamaMessage, ModelResponse } from 'ollama';
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

/**
 * Convert internal Message[] to Ollama format.
 *
 * Ollama accepts 'user', 'assistant', and 'system' roles.
 */
function toOllamaMessages(messages: Message[]): OllamaMessage[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

export class OllamaProvider implements ProviderInstance {
  readonly name: string;
  readonly config: ProviderConfig;
  private client: Ollama;

  constructor(config?: Partial<ProviderConfig> & { apiKey?: string }) {
    const defaults = PROVIDER_DEFAULTS.ollama;
    this.config = {
      name: defaults.name,
      baseUrl: config?.baseUrl ?? defaults.baseUrl,
      apiKey: '',
      models: defaults.models,
      isLocal: true,
    };
    this.name = this.config.name;
    this.client = new Ollama({
      host: this.config.baseUrl,
    });
  }

  // ── Validation ────────────────────────────────────
  // Ollama is local and doesn't require an API key.

  validateConfig(): boolean {
    return true;
  }

  // ── Non-streaming chat ────────────────────────────

  async chat(messages: Message[], options: ChatOptions): Promise<ProviderResponse> {
    const ollamaMessages = toOllamaMessages(messages);

    try {
      const response = await this.client.chat({
        model: this._resolveModel(),
        messages: ollamaMessages,
        options: {
          temperature: options.temperature ?? 0.7,
          top_p: options.topP ?? 1.0,
          num_predict: options.maxTokens ?? 4096,
        },
        stream: false,
      });

      const tokens: TokenUsage | undefined = response.prompt_eval_count != null
        ? {
            prompt_tokens: response.prompt_eval_count,
            completion_tokens: response.eval_count ?? 0,
            total_tokens: (response.prompt_eval_count ?? 0) + (response.eval_count ?? 0),
          }
        : undefined;

      return {
        content: response.message.content,
        tokens,
        model: response.model,
      };
    } catch (err: unknown) {
      throw new Error(
        `Ollama chat error: ${(err as Error).message ?? String(err)}`,
      );
    }
  }

  // ── Streaming chat ────────────────────────────────

  async *stream(messages: Message[], options: ChatOptions): AsyncIterable<StreamChunk> {
    const ollamaMessages = toOllamaMessages(messages);

    try {
      const stream = await this.client.chat({
        model: this._resolveModel(),
        messages: ollamaMessages,
        options: {
          temperature: options.temperature ?? 0.7,
          top_p: options.topP ?? 1.0,
          num_predict: options.maxTokens ?? 4096,
        },
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.message.content;

        if (content) {
          yield { content, done: false };
        }

        if (chunk.done) {
          const tokens: TokenUsage | undefined =
            chunk.prompt_eval_count != null
              ? {
                  prompt_tokens: chunk.prompt_eval_count,
                  completion_tokens: chunk.eval_count ?? 0,
                  total_tokens:
                    (chunk.prompt_eval_count ?? 0) + (chunk.eval_count ?? 0),
                }
              : undefined;

          yield { content: '', done: true, tokens };
          return;
        }
      }

      // Fallback done signal if the loop exits without chunk.done
      yield { content: '', done: true };
    } catch (err: unknown) {
      throw new Error(
        `Ollama stream error: ${(err as Error).message ?? String(err)}`,
      );
    }
  }

  // ── Models ────────────────────────────────────────
  // Dynamically fetch installed models from the Ollama instance.

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.list();
      return response.models.map((m: ModelResponse) => ({
        id: m.name,
        name: m.name,
        maxTokens: 4096,
        contextWindow: 8192,
      }));
    } catch {
      // Fall back to the static defaults if Ollama is unreachable
      return this.config.models;
    }
  }

  // ── Connection test ───────────────────────────────

  async testConnection(): Promise<boolean> {
    try {
      await this.client.list();
      return true;
    } catch {
      return false;
    }
  }

  // ── Helpers ───────────────────────────────────────

  private _resolveModel(): string {
    return this.config.models[0]?.id ?? 'llama3.3';
  }
}
