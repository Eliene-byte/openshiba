import type { ProviderInstance } from '../types.js';
/**
 * Create a provider instance by name.
 *
 * @param providerName  - Key from PROVIDER_DEFAULTS (e.g. "openrouter", "anthropic")
 * @param apiKey        - Optional API key override
 * @param baseUrl       - Optional base URL override
 * @returns A fully-constructed ProviderInstance
 * @throws Error when the provider name is not recognised
 */
export declare function createProvider(providerName: string, apiKey?: string, baseUrl?: string): ProviderInstance;
export { OpenRouterProvider } from './openrouter.js';
export { AnthropicProvider } from './anthropic.js';
export { GroqProvider } from './groq.js';
export { OllamaProvider } from './ollama.js';
export { OpenAIProvider } from './openai.js';
export { CustomProvider } from './custom.js';
//# sourceMappingURL=base.d.ts.map