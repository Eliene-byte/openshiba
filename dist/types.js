// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Shared Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider Defaults
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const PROVIDER_DEFAULTS = {
    openrouter: {
        name: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        isLocal: false,
        models: [
            { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', maxTokens: 8192, contextWindow: 200000 },
            { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', maxTokens: 8192, contextWindow: 200000 },
            { id: 'openai/gpt-4o', name: 'GPT-4o', maxTokens: 16384, contextWindow: 128000 },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384, contextWindow: 128000 },
            { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', maxTokens: 8192, contextWindow: 1048576 },
            { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', maxTokens: 8192, contextWindow: 131072 },
            { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', maxTokens: 8192, contextWindow: 131072 },
        ],
    },
    openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1',
        isLocal: false,
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 16384, contextWindow: 128000 },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384, contextWindow: 128000 },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096, contextWindow: 128000 },
            { id: 'o1-preview', name: 'o1 Preview', maxTokens: 32768, contextWindow: 128000 },
        ],
    },
    anthropic: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com',
        isLocal: false,
        models: [
            { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', maxTokens: 8192, contextWindow: 200000 },
            { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', maxTokens: 8192, contextWindow: 200000 },
            { id: 'claude-haiku-4-20250414', name: 'Claude Haiku 4', maxTokens: 8192, contextWindow: 200000 },
        ],
    },
    groq: {
        name: 'Groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        isLocal: false,
        models: [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', maxTokens: 32768, contextWindow: 131072 },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', maxTokens: 8192, contextWindow: 131072 },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', maxTokens: 32768, contextWindow: 32768 },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B', maxTokens: 8192, contextWindow: 8192 },
        ],
    },
    ollama: {
        name: 'Ollama (Local)',
        baseUrl: 'http://localhost:11434',
        isLocal: true,
        models: [
            { id: 'llama3.3', name: 'Llama 3.3', maxTokens: 4096, contextWindow: 131072 },
            { id: 'mistral', name: 'Mistral', maxTokens: 4096, contextWindow: 32768 },
            { id: 'codellama', name: 'Code Llama', maxTokens: 4096, contextWindow: 16384 },
            { id: 'qwen2.5', name: 'Qwen 2.5', maxTokens: 4096, contextWindow: 32768 },
        ],
    },
    lmstudio: {
        name: 'LM Studio (Local)',
        baseUrl: 'http://localhost:1234/v1',
        isLocal: true,
        models: [
            { id: 'local-model', name: 'Local Model', maxTokens: 4096, contextWindow: 8192 },
        ],
    },
    custom: {
        name: 'Custom Provider',
        baseUrl: 'http://localhost:8080/v1',
        isLocal: false,
        models: [
            { id: 'custom-model', name: 'Custom Model', maxTokens: 4096, contextWindow: 8192 },
        ],
    },
};
export const DEFAULT_SESSION_CONFIG = {
    provider: 'ollama',
    model: 'llama3.3',
    temperature: 0.7,
    topP: 1.0,
    maxTokens: 4096,
    systemPrompt: 'You are a helpful AI assistant. Be concise and clear.',
    streaming: true,
    profile: 'default',
    memoryEnabled: true,
};
export const DEFAULT_THEME = {
    primary: '#e8873a',
    secondary: '#ff9f5f',
    background: '#0d0d0d',
    text: '#cccccc',
    error: '#ff4444',
    success: '#44ff44',
    warning: '#ffcc00',
    muted: '#666666',
};
//# sourceMappingURL=types.js.map