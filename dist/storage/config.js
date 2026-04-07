// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — ConfigStore Implementation (conf-based)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import Conf from 'conf';
import { PROVIDER_DEFAULTS, DEFAULT_SESSION_CONFIG } from '../types.js';
class ConfigStoreImpl {
    conf;
    constructor() {
        this.conf = new Conf({
            projectName: 'openshiba',
        });
    }
    get(key) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this.conf.get(key);
        }
        catch {
            return undefined;
        }
    }
    set(key, value) {
        try {
            this.conf.set(key, value);
        }
        catch (err) {
            throw new Error(`Failed to set config key "${key}": ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    delete(key) {
        try {
            this.conf.delete(key);
        }
        catch (err) {
            throw new Error(`Failed to delete config key "${key}": ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    getAll() {
        try {
            const store = this.conf.store;
            return { ...store };
        }
        catch {
            return {};
        }
    }
    getProviderConfigs() {
        try {
            const savedConfigs = (this.conf.get('providerConfigs') ?? {});
            const configs = {};
            // First, load all provider defaults
            for (const [key, defaults] of Object.entries(PROVIDER_DEFAULTS)) {
                configs[key] = {
                    ...defaults,
                    apiKey: '',
                };
            }
            // Then merge saved configs on top of defaults
            for (const [key, saved] of Object.entries(savedConfigs)) {
                const defaults = PROVIDER_DEFAULTS[key];
                if (defaults) {
                    configs[key] = {
                        ...defaults,
                        apiKey: saved.apiKey ?? '',
                        baseUrl: saved.baseUrl ?? defaults.baseUrl,
                        name: saved.name ?? defaults.name,
                        isLocal: saved.isLocal ?? defaults.isLocal,
                        models: saved.models ?? defaults.models,
                    };
                }
                else {
                    // Custom provider not in defaults — use saved as-is with required fields
                    configs[key] = {
                        name: saved.name ?? key,
                        baseUrl: saved.baseUrl ?? '',
                        apiKey: saved.apiKey ?? '',
                        models: saved.models ?? [],
                        isLocal: saved.isLocal ?? false,
                    };
                }
            }
            return configs;
        }
        catch {
            // Return defaults if anything goes wrong
            const configs = {};
            for (const [key, defaults] of Object.entries(PROVIDER_DEFAULTS)) {
                configs[key] = { ...defaults, apiKey: '' };
            }
            return configs;
        }
    }
    setProviderConfig(name, config) {
        try {
            const savedConfigs = (this.conf.get('providerConfigs') ?? {});
            savedConfigs[name] = {
                apiKey: config.apiKey,
                baseUrl: config.baseUrl,
                name: config.name,
                isLocal: config.isLocal,
                models: config.models,
            };
            this.conf.set('providerConfigs', savedConfigs);
        }
        catch (err) {
            throw new Error(`Failed to save provider config for "${name}": ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    getSessionConfig(profile) {
        try {
            const profileName = profile ?? 'default';
            const profiles = (this.conf.get('profiles') ?? {});
            const saved = profiles[profileName];
            if (saved) {
                // Merge with defaults to ensure all fields exist
                return {
                    ...DEFAULT_SESSION_CONFIG,
                    ...saved,
                    profile: saved.profile ?? profileName,
                };
            }
            // Return default config with the profile name
            return {
                ...DEFAULT_SESSION_CONFIG,
                profile: profileName,
            };
        }
        catch {
            return { ...DEFAULT_SESSION_CONFIG, profile: profile ?? 'default' };
        }
    }
    setSessionConfig(config) {
        try {
            const profileName = config.profile || 'default';
            const profiles = (this.conf.get('profiles') ?? {});
            profiles[profileName] = {
                ...config,
                profile: profileName,
            };
            this.conf.set('profiles', profiles);
            this.conf.set('activeProfile', profileName);
        }
        catch (err) {
            throw new Error(`Failed to save session config for profile "${config.profile}": ${err instanceof Error ? err.message : String(err)}`);
        }
    }
}
export const configStore = new ConfigStoreImpl();
//# sourceMappingURL=config.js.map