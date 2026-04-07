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
export declare const PROVIDER_DEFAULTS: Record<string, Omit<ProviderConfig, 'apiKey'>>;
export declare const DEFAULT_SESSION_CONFIG: SessionConfig;
export declare const DEFAULT_THEME: ThemeConfig;
//# sourceMappingURL=types.d.ts.map