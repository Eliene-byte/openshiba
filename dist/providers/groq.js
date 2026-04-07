// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Groq Provider (OpenAI-compatible)
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
export class GroqProvider {
    name;
    config;
    client;
    constructor(config) {
        const defaults = PROVIDER_DEFAULTS.groq;
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
            throw new Error('Groq provider requires an API key. Set it via /key or the GROQ_API_KEY env var.');
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
            }
            catch (err) {
                lastError = err;
                const status = err.status;
                const isRateLimit = status === 429;
                const isServerError = status !== undefined && status >= 500;
                const isTimeout = err.message?.includes('timeout') ?? false;
                if (isRateLimit || isServerError || isTimeout) {
                    if (attempt < MAX_RETRIES - 1) {
                        const wait = BASE_DELAY_MS * Math.pow(2, attempt);
                        await delay(wait);
                        continue;
                    }
                }
                throw new Error(`Groq API error: ${err.message ?? String(err)}`);
            }
        }
        throw new Error(`Groq request failed after ${MAX_RETRIES} retries: ${lastError.message ?? String(lastError)}`);
    }
    // ── Streaming chat ────────────────────────────────
    async *stream(messages, options) {
        if (!this.validateConfig()) {
            throw new Error('Groq provider requires an API key. Set it via /key or the GROQ_API_KEY env var.');
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
                    model: this._resolveModel(),
                    messages: apiMessages,
                    temperature: options.temperature ?? 0.7,
                    top_p: options.topP ?? 1.0,
                    max_tokens: options.maxTokens ?? 4096,
                    stream: true,
                });
                let usage;
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
            }
            catch (err) {
                lastError = err;
                const status = err.status;
                const isRateLimit = status === 429;
                const isServerError = status !== undefined && status >= 500;
                const isTimeout = err.message?.includes('timeout') ?? false;
                if (isRateLimit || isServerError || isTimeout) {
                    if (attempt < MAX_RETRIES - 1) {
                        const wait = BASE_DELAY_MS * Math.pow(2, attempt);
                        await delay(wait);
                        continue;
                    }
                }
                throw new Error(`Groq stream error: ${err.message ?? String(err)}`);
            }
        }
        throw new Error(`Groq stream failed after ${MAX_RETRIES} retries: ${lastError.message ?? String(lastError)}`);
    }
    // ── Models ────────────────────────────────────────
    async listModels() {
        return this.config.models;
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
    _resolveModel() {
        return this.config.models[0]?.id ?? 'llama-3.3-70b-versatile';
    }
}
//# sourceMappingURL=groq.js.map