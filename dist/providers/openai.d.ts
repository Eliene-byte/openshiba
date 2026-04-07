import type { ProviderInstance, ProviderConfig, ProviderResponse, Message, ChatOptions, StreamChunk, ModelInfo } from '../types.js';
export declare class OpenAIProvider implements ProviderInstance {
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
    private _resolveModel;
}
//# sourceMappingURL=openai.d.ts.map