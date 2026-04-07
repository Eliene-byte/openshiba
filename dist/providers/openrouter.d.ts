import type { ProviderInstance, ProviderConfig, ProviderResponse, Message, ChatOptions, StreamChunk, ModelInfo } from '../types.js';
export declare class OpenRouterProvider implements ProviderInstance {
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
    /** Pick the first model by default.  In practice the model is chosen by the
     *  caller and embedded in the message history / conversation metadata. */
    private _resolveModel;
}
//# sourceMappingURL=openrouter.d.ts.map