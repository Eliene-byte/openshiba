// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Ollama Provider (local inference)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { Ollama } from 'ollama';
import { PROVIDER_DEFAULTS } from '../types.js';
/**
 * Convert internal Message[] to Ollama format.
 *
 * Ollama accepts 'user', 'assistant', and 'system' roles.
 */
function toOllamaMessages(messages) {
    return messages.map((m) => ({
        role: m.role,
        content: m.content,
    }));
}
export class OllamaProvider {
    name;
    config;
    client;
    constructor(config) {
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
    validateConfig() {
        return true;
    }
    // ── Non-streaming chat ────────────────────────────
    async chat(messages, options) {
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
            const tokens = response.prompt_eval_count != null
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
        }
        catch (err) {
            throw new Error(`Ollama chat error: ${err.message ?? String(err)}`);
        }
    }
    // ── Streaming chat ────────────────────────────────
    async *stream(messages, options) {
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
                    const tokens = chunk.prompt_eval_count != null
                        ? {
                            prompt_tokens: chunk.prompt_eval_count,
                            completion_tokens: chunk.eval_count ?? 0,
                            total_tokens: (chunk.prompt_eval_count ?? 0) + (chunk.eval_count ?? 0),
                        }
                        : undefined;
                    yield { content: '', done: true, tokens };
                    return;
                }
            }
            // Fallback done signal if the loop exits without chunk.done
            yield { content: '', done: true };
        }
        catch (err) {
            throw new Error(`Ollama stream error: ${err.message ?? String(err)}`);
        }
    }
    // ── Models ────────────────────────────────────────
    // Dynamically fetch installed models from the Ollama instance.
    async listModels() {
        try {
            const response = await this.client.list();
            return response.models.map((m) => ({
                id: m.name,
                name: m.name,
                maxTokens: 4096,
                contextWindow: 8192,
            }));
        }
        catch {
            // Fall back to the static defaults if Ollama is unreachable
            return this.config.models;
        }
    }
    // ── Connection test ───────────────────────────────
    async testConnection() {
        try {
            await this.client.list();
            return true;
        }
        catch {
            return false;
        }
    }
    // ── Helpers ───────────────────────────────────────
    _resolveModel() {
        return this.config.models[0]?.id ?? 'llama3.3';
    }
}
//# sourceMappingURL=ollama.js.map