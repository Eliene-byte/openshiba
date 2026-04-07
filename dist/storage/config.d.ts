import type { ConfigStore, ProviderConfig, SessionConfig } from '../types.js';
declare class ConfigStoreImpl implements ConfigStore {
    private conf;
    constructor();
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    delete(key: string): void;
    getAll(): Record<string, unknown>;
    getProviderConfigs(): Record<string, ProviderConfig>;
    setProviderConfig(name: string, config: ProviderConfig): void;
    getSessionConfig(profile?: string): SessionConfig;
    setSessionConfig(config: SessionConfig): void;
}
export declare const configStore: ConfigStoreImpl;
export {};
//# sourceMappingURL=config.d.ts.map