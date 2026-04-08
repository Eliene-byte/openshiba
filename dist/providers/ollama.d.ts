import type { ProviderInstance, ProviderConfig, ProviderResponse, Message, ChatOptions, StreamChunk, ModelInfo } from '../types.js';
export declare class OllamaProvider implements ProviderInstance {
    readonly name: string;
    readonly config: ProviderConfig;
    private client;
    constructor(config?: Partial<ProviderConfig> & {
        apiKey?: string;
    });
    validateConfig(): boolean;
    chat(messages: Message[], options: ChatOptions): Promise<ProviderResponse>;
    stream(messages: Message[], options: ChatOptions): AsyncIterable<StreamChunk>;
    listModels(): Promise<ModelInfo[]>;
    testConnection(): Promise<boolean>;
    isInstalled(): boolean;
    private _getDefaultModel;
}
//# sourceMappingURL=ollama.d.ts.map