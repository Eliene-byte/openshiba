// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — OpenRouter Provider (OpenAI-compatible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import OpenAI from 'openai';
import { PROVIDER_DEFAULTS } from '../types.js';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function extractTokenUsage(usage) {
    if (!usage)
        return undefined;
    return {
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
    };
}
export class OpenRouterProvider {
    name;
    config;
    client;
    constructor(config) {
        const defaults = PROVIDER_DEFAULTS.openrouter;
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
    validateConfig() {
        return this.config.apiKey.length > 0;
    }
    // ── Non-streaming chat ────────────────────────────
    async chat(messages, options) {
        if (!this.validateConfig()) {
            throw new Error('OpenRouter provider requires an API key. Set it via /key or the OPENROUTER_API_KEY env var.');
        }
        const systemPrompt = options.systemPrompt ?? '';
        const apiMessages = [];
        if (systemPrompt) {
            apiMessages.push({ role: 'system', content: systemPrompt });
        }
        for (const msg of messages) {
            apiMessages.push({ role: msg.role, content: msg.content });
        }
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.chat.completions.create({
                    model: messages.length > 0 ? (options.model ?? this._resolveModel()) : this.config.models[0].id,
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
            }
            catch (err) {
                lastError = err;
                const status = err.status;
                // Retry on rate-limit (429) or server errors (5xx)
                if (status === 429 || (status !== undefined && status >= 500)) {
                    if (attempt < MAX_RETRIES - 1) {
                        const wait = BASE_DELAY_MS * Math.pow(2, attempt);
                        await delay(wait);
                        continue;
                    }
                }
                // Non-retryable error – throw immediately
                throw new Error(`OpenRouter API error: ${err.message ?? String(err)}`);
            }
        }
        throw new Error(`OpenRouter request failed after ${MAX_RETRIES} retries: ${lastError.message ?? String(lastError)}`);
    }
    // ── Streaming chat ────────────────────────────────
    async *stream(messages, options) {
        if (!this.validateConfig()) {
            throw new Error('OpenRouter provider requires an API key. Set it via /key or the OPENROUTER_API_KEY env var.');
        }
        const systemPrompt = options.systemPrompt ?? '';
        const apiMessages = [];
        if (systemPrompt) {
            apiMessages.push({ role: 'system', content: systemPrompt });
        }
        for (const msg of messages) {
            apiMessages.push({ role: msg.role, content: msg.content });
        }
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const stream = await this.client.chat.completions.create({
                    model: options.model ?? this._resolveModel(),
                    messages: apiMessages,
                    temperature: options.temperature ?? 0.7,
                    top_p: options.topP ?? 1.0,
                    max_tokens: options.maxTokens ?? 4096,
                    stream: true,
                });
                let model = '';
                let usage;
                for await (const chunk of stream) {
                    model = chunk.model;
                    usage = extractTokenUsage(chunk.usage);
                    const delta = chunk.choices[0]?.delta?.content;
                    if (delta) {
                        yield { content: delta, done: false, tokens: usage };
                    }
                    if (chunk.choices[0]?.finish_reason === 'stop') {
                        yield { content: '', done: true, tokens: usage };
                    }
                }
                return; // success
            }
            catch (err) {
                lastError = err;
                const status = err.status;
                if (status === 429 || (status !== undefined && status >= 500)) {
                    if (attempt < MAX_RETRIES - 1) {
                        const wait = BASE_DELAY_MS * Math.pow(2, attempt);
                        await delay(wait);
                        continue;
                    }
                }
                throw new Error(`OpenRouter stream error: ${err.message ?? String(err)}`);
            }
        }
        throw new Error(`OpenRouter stream failed after ${MAX_RETRIES} retries: ${lastError.message ?? String(lastError)}`);
    }
    // ── Models ────────────────────────────────────────
    async listModels() {
        try {
            const response = await this.client.models.list();
            const models = response.data.map((m) => ({
                id: m.id,
                name: m.id,
                maxTokens: 4096,
                contextWindow: 8192,
            }));
            return models.length > 0 ? models : this.config.models;
        }
        catch {
            return this.config.models;
        }
    }
    // ── Connection test ───────────────────────────────
    async testConnection() {
        if (!this.validateConfig())
            return false;
        try {
            await this.client.models.list();
            return true;
        }
        catch {
            return false;
        }
    }
    // ── Helpers ───────────────────────────────────────
    /** Pick the first model by default.  In practice the model is chosen by the
     *  caller and embedded in the message history / conversation metadata. */
    _resolveModel() {
        return this.config.models[0]?.id ?? 'anthropic/claude-sonnet-4';
    }
}
//# sourceMappingURL=openrouter.js.map