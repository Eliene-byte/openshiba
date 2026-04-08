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
                model: options.model ?? this.config.models[0]?.id ?? 'llama3.3',
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
                model: options.model ?? this.config.models[0]?.id ?? 'llama3.3',
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
    // Returns ONLY models that are actually downloaded locally.
    // Returns empty array if Ollama is not running — no fallback.
    async listModels() {
        try {
            const response = await this.client.list();
            return response.models.map((m) => ({
                id: m.name,
                name: m.name,
                maxTokens: 4096,
                contextWindow: 8192,
                size: m.size ? formatBytes(m.size) : undefined,
            }));
        }
        catch {
            // Ollama is not running or not installed — return empty, no fake models
            return [];
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
    // ── Check if Ollama binary exists on PATH ─────────
    isInstalled() {
        try {
            const { execSync } = require('node:child_process');
            const isWin = process.platform === 'win32';
            const cmd = isWin ? 'where ollama' : 'which ollama';
            execSync(cmd, { stdio: 'ignore' });
            return true;
        }
        catch {
            return false;
        }
    }
    // ── Helpers ───────────────────────────────────────
    _getDefaultModel() {
        return this.config.models[0]?.id ?? 'llama3.3';
    }
}
// ── Utility ─────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes >= 1e9)
        return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6)
        return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3)
        return `${(bytes / 1e3).toFixed(1)} KB`;
    return `${bytes} B`;
}
//# sourceMappingURL=ollama.js.map