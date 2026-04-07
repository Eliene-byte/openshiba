// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Shared Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  tokens?: TokenUsage;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  provider: string;
  model: string;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  models: ModelInfo[];
  isLocal: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  maxTokens: number;
  contextWindow: number;
}

export interface SessionConfig {
  provider: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  streaming: boolean;
  profile: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  tokens?: TokenUsage;
}

export interface ProviderResponse {
  content: string;
  tokens?: TokenUsage;
  model: string;
}

export interface AppConfig {
  profiles: Record<string, SessionConfig>;
  activeProfile: string;
  theme: ThemeConfig;
  debug: boolean;
  historyPath: string;
}

export interface ThemeConfig {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  error: string;
  success: string;
  warning: string;
  muted: string;
}

export interface CommandContext {
  config: SessionConfig;
  conversation: Conversation;
  provider: ProviderInstance;
  history: HistoryStore;
  configStore: ConfigStore;
  appendMessage: (role: 'user' | 'assistant', content: string) => void;
  setConfig: (partial: Partial<SessionConfig>) => void;
  exit: () => void;
  setInput: (value: string) => void;
}

export type CommandHandler = (args: string, ctx: CommandContext) => void | Promise<void>;

export interface SlashCommand {
  name: string;
  description: string;
  usage?: string;
  handler: CommandHandler;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ProviderInstance {
  name: string;
  config: ProviderConfig;
  chat(messages: Message[], options: ChatOptions): Promise<ProviderResponse>;
  stream(messages: Message[], options: ChatOptions): AsyncIterable<StreamChunk>;
  listModels(): Promise<ModelInfo[]>;
  testConnection(): Promise<boolean>;
  validateConfig(): boolean;
}

export interface ChatOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Storage Interfaces
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ConfigStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
  getAll(): Record<string, unknown>;
  getProviderConfigs(): Record<string, ProviderConfig>;
  setProviderConfig(name: string, config: ProviderConfig): void;
  getSessionConfig(profile?: string): SessionConfig;
  setSessionConfig(config: SessionConfig): void;
}

export interface HistoryStore {
  saveConversation(conversation: Conversation): string;
  loadConversation(id: string): Conversation | null;
  listConversations(limit?: number, offset?: number): Conversation[];
  searchConversations(query: string): Conversation[];
  deleteConversation(id: string): boolean;
  updateConversation(id: string, updates: Partial<Conversation>): boolean;
  getTotalCount(): number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Provider Defaults
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PROVIDER_DEFAULTS: Record<string, Omit<ProviderConfig, 'apiKey'>> = {
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

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  provider: 'ollama',
  model: 'llama3.3',
  temperature: 0.7,
  topP: 1.0,
  maxTokens: 4096,
  systemPrompt: 'You are a helpful AI assistant. Be concise and clear.',
  streaming: true,
  profile: 'default',
};

export const DEFAULT_THEME: ThemeConfig = {
  primary: '#e8873a',
  secondary: '#ff9f5f',
  background: '#0d0d0d',
  text: '#cccccc',
  error: '#ff4444',
  success: '#44ff44',
  warning: '#ffcc00',
  muted: '#666666',
};
