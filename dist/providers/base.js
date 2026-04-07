// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Provider Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { PROVIDER_DEFAULTS } from '../types.js';
import { OpenRouterProvider } from './openrouter.js';
import { AnthropicProvider } from './anthropic.js';
import { GroqProvider } from './groq.js';
import { OllamaProvider } from './ollama.js';
import { OpenAIProvider } from './openai.js';
import { CustomProvider } from './custom.js';
const PROVIDER_MAP = {
    openrouter: OpenRouterProvider,
    anthropic: AnthropicProvider,
    groq: GroqProvider,
    ollama: OllamaProvider,
    openai: OpenAIProvider,
    custom: CustomProvider,
};
const SUPPORTED_PROVIDERS = Object.keys(PROVIDER_MAP).join(', ');
/**
 * Create a provider instance by name.
 *
 * @param providerName  - Key from PROVIDER_DEFAULTS (e.g. "openrouter", "anthropic")
 * @param apiKey        - Optional API key override
 * @param baseUrl       - Optional base URL override
 * @returns A fully-constructed ProviderInstance
 * @throws Error when the provider name is not recognised
 */
export function createProvider(providerName, apiKey, baseUrl) {
    const normalised = providerName.toLowerCase().trim();
    const defaults = PROVIDER_DEFAULTS[normalised];
    if (!defaults) {
        throw new Error(`Unknown provider "${providerName}". Supported providers: ${SUPPORTED_PROVIDERS}`);
    }
    const config = {
        name: defaults.name,
        baseUrl: baseUrl ?? defaults.baseUrl,
        apiKey: apiKey ?? '',
        models: defaults.models,
        isLocal: defaults.isLocal,
    };
    const Ctor = PROVIDER_MAP[normalised];
    if (!Ctor) {
        // This should never happen given the check above, but TypeScript needs it.
        throw new Error(`No constructor registered for provider "${normalised}".`);
    }
    return new Ctor(config);
}
export { OpenRouterProvider } from './openrouter.js';
export { AnthropicProvider } from './anthropic.js';
export { GroqProvider } from './groq.js';
export { OllamaProvider } from './ollama.js';
export { OpenAIProvider } from './openai.js';
export { CustomProvider } from './custom.js';
//# sourceMappingURL=base.js.map