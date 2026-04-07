// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Anthropic Provider (native SDK)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import Anthropic from '@anthropic-ai/sdk';
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
        prompt_tokens: usage.input_tokens,
        completion_tokens: usage.output_tokens,
        total_tokens: usage.input_tokens + usage.output_tokens,
    };
}
/**
 * Convert internal Message[] to Anthropic's message format.
 *
 * - System messages are excluded from the array (handled via the `system` param).
 * - Only 'user' and 'assistant' roles are kept.
 */
function toAnthropicMessages(messages) {
    return messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
        role: m.role,
        content: m.content,
    }));
}
export class AnthropicProvider {
    name;
    config;
    client;
    constructor(config) {
        const defaults = PROVIDER_DEFAULTS.anthropic;
        this.config = {
            name: defaults.name,
            baseUrl: config?.baseUrl ?? defaults.baseUrl,
            apiKey: config?.apiKey ?? '',
            models: defaults.models,
            isLocal: defaults.isLocal,
        };
        this.name = this.config.name;
        this.client = new Anthropic({
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
            throw new Error('Anthropic provider requires an API key. Set it via /key or the ANTHROPIC_API_KEY env var.');
        }
        const anthropicMessages = toAnthropicMessages(messages);
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await this.client.messages.create({
                    model: this._resolveModel(),
                    max_tokens: options.maxTokens ?? 4096,
                    temperature: options.temperature ?? 0.7,
                    top_p: options.topP ?? 1.0,
                    system: options.systemPrompt ?? undefined,
                    messages: anthropicMessages,
                });
                // Anthropic returns an array of content blocks; concatenate text ones.
                const textParts = response.content
                    .filter((block) => block.type === 'text')
                    .map((block) => block.text);
                return {
                    content: textParts.join(''),
                    tokens: extractTokenUsage(response.usage),
                    model: response.model,
                };
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
                throw new Error(`Anthropic API error: ${err.message ?? String(err)}`);
            }
        }
        throw new Error(`Anthropic request failed after ${MAX_RETRIES} retries: ${lastError.message ?? String(lastError)}`);
    }
    // ── Streaming chat ────────────────────────────────
    async *stream(messages, options) {
        if (!this.validateConfig()) {
            throw new Error('Anthropic provider requires an API key. Set it via /key or the ANTHROPIC_API_KEY env var.');
        }
        const anthropicMessages = toAnthropicMessages(messages);
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const stream = this.client.messages.stream({
                    model: this._resolveModel(),
                    max_tokens: options.maxTokens ?? 4096,
                    temperature: options.temperature ?? 0.7,
                    top_p: options.topP ?? 1.0,
                    system: options.systemPrompt ?? undefined,
                    messages: anthropicMessages,
                });
                let usage;
                // The Anthropic SDK stream is an async iterable of MessageStreamEvent
                for await (const event of stream) {
                    if (event.type === 'content_block_delta' &&
                        event.delta.type === 'text_delta') {
                        yield {
                            content: event.delta.text,
                            done: false,
                        };
                    }
                    if (event.type === 'message_stop') {
                        // Grab the final message's usage if available
                        const finalMessage = await stream.finalMessage();
                        usage = extractTokenUsage(finalMessage.usage);
                        yield { content: '', done: true, tokens: usage };
                        return;
                    }
                }
                // If the loop ends without message_stop, still emit done
                yield { content: '', done: true };
                return;
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
                throw new Error(`Anthropic stream error: ${err.message ?? String(err)}`);
            }
        }
        throw new Error(`Anthropic stream failed after ${MAX_RETRIES} retries: ${lastError.message ?? String(lastError)}`);
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
            // Send a minimal message to verify the API key is valid
            await this.client.messages.create({
                model: this._resolveModel(),
                max_tokens: 1,
                messages: [{ role: 'user', content: 'hi' }],
            });
            return true;
        }
        catch {
            return false;
        }
    }
    // ── Helpers ───────────────────────────────────────
    _resolveModel() {
        return this.config.models[0]?.id ?? 'claude-sonnet-4-20250514';
    }
}
//# sourceMappingURL=anthropic.js.map