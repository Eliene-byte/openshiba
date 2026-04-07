#!/usr/bin/env node
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OpenShiba — Main REPL (Read-Eval-Print Loop)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import chalk from 'chalk';
import crypto from 'node:crypto';
import { DEFAULT_SESSION_CONFIG, PROVIDER_DEFAULTS } from '../types.js';
import { createProvider } from '../providers/base.js';
import { configStore } from '../storage/config.js';
import { historyStore } from '../storage/history.js';
import { commandMap } from './commands/index.js';
import { Header } from '../ui/header.js';
import { MessageItem } from '../ui/message.js';
import { Statusbar } from '../ui/statusbar.js';
import { Spinner } from '../ui/spinner.js';
import { ShibaMascot } from '../ui/shiba.js';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PROMPT_SYMBOL = chalk.hex('#e8873a')('> ');
const CURSOR = chalk.hex('#e8873a')('█');
export function Repl({ initialInput, pipeMode, profile, debugMode }) {
    const { exit } = useApp();
    // ─── State ───
    const [sessionConfig, setSessionConfigState] = useState(() => {
        const saved = configStore.getSessionConfig(profile);
        return { ...DEFAULT_SESSION_CONFIG, ...saved, profile: profile ?? saved.profile ?? 'default' };
    });
    const [conversation, setConversation] = useState(() => ({
        id: crypto.randomUUID(),
        name: `Session ${new Date().toLocaleDateString()}`,
        messages: [],
        provider: sessionConfig.provider,
        model: sessionConfig.model,
        systemPrompt: sessionConfig.systemPrompt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }));
    const [provider, setProvider] = useState(null);
    const [input, setInput] = useState('');
    const [streamContent, setStreamContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [tokenUsage, setTokenUsage] = useState(null);
    const [error, setError] = useState(null);
    const [multilineMode, setMultilineMode] = useState(false);
    const [multilineBuffer, setMultilineBuffer] = useState('');
    const [showMascot, setShowMascot] = useState(false);
    const [outputLines, setOutputLines] = useState([]);
    // Ref to track the latest conversation for async callbacks
    const conversationRef = useRef(conversation);
    conversationRef.current = conversation;
    // ─── Initialize Provider ───
    useEffect(() => {
        const initProvider = async () => {
            try {
                const savedProviders = configStore.getProviderConfigs();
                const providerConfig = savedProviders[sessionConfig.provider];
                const apiKey = providerConfig?.apiKey ?? '';
                const baseUrl = providerConfig?.baseUrl;
                const newProvider = createProvider(sessionConfig.provider, apiKey, baseUrl);
                // Test connection in background
                newProvider.testConnection().then((ok) => {
                    setConnected(ok);
                }).catch(() => {
                    setConnected(false);
                });
                setProvider(newProvider);
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                setError(`Failed to initialize provider: ${msg}`);
                setConnected(false);
            }
        };
        initProvider();
    }, [sessionConfig.provider]);
    // ─── Process pipe input ───
    useEffect(() => {
        if (pipeMode && initialInput) {
            processUserInput(initialInput);
        }
    }, [pipeMode]);
    // ─── Command Context ───
    const getCommandContext = useCallback(() => {
        return {
            config: sessionConfig,
            conversation: conversationRef.current,
            provider: provider,
            history: historyStore,
            configStore,
            appendMessage: (role, content) => {
                const msg = {
                    id: crypto.randomUUID(),
                    role,
                    content,
                    timestamp: Date.now(),
                };
                setConversation(prev => ({
                    ...prev,
                    messages: [...prev.messages, msg],
                    updatedAt: Date.now(),
                }));
            },
            setConfig: (partial) => {
                setSessionConfigState(prev => {
                    const updated = { ...prev, ...partial };
                    configStore.setSessionConfig(updated);
                    return updated;
                });
            },
            exit: () => exit(),
            setInput: (value) => setInput(value),
        };
    }, [sessionConfig, provider, exit]);
    // ─── Add Output Line ───
    const addOutput = useCallback((text, color) => {
        setOutputLines(prev => [...prev, { text, color }]);
    }, []);
    // ─── Handle Slash Commands ───
    const handleCommand = useCallback(async (raw) => {
        // Normalize: strip leading slashes (Windows can duplicate them)
        const normalized = raw.trim().replace(/^\/+(?!\/)/, '/');
        const parts = normalized.split(/\s+/);
        const cmdName = parts[0].toLowerCase().replace(/^\/+/, '');
        const args = parts.slice(1).join(' ');
        const command = commandMap.get(cmdName);
        if (!command) {
            addOutput(chalk.hex('#ff4444')(`Unknown command: /${cmdName}. Type /help for available commands.`));
            return;
        }
        try {
            // Special handling for /whoami to show mascot
            if (cmdName === 'whoami') {
                setShowMascot(true);
            }
            const ctx = getCommandContext();
            await command.handler(args, ctx);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            addOutput(chalk.hex('#ff4444')(`Error: ${msg}`));
        }
    }, [getCommandContext, addOutput]);
    // ─── Process AI Request ───
    const processUserInput = useCallback(async (userText) => {
        if (!provider || !userText.trim())
            return;
        // Add user message
        const userMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userText,
            timestamp: Date.now(),
        };
        setConversation(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            updatedAt: Date.now(),
        }));
        setIsLoading(true);
        setIsStreaming(false);
        setStreamContent('');
        setError(null);
        try {
            // Build messages array with system prompt
            const systemMsg = {
                id: crypto.randomUUID(),
                role: 'system',
                content: sessionConfig.systemPrompt,
                timestamp: Date.now(),
            };
            const allMessages = [systemMsg, ...conversationRef.current.messages, userMessage];
            if (sessionConfig.streaming) {
                // ── Streaming Mode ──
                setIsStreaming(true);
                let fullContent = '';
                const stream = provider.stream(allMessages, {
                    temperature: sessionConfig.temperature,
                    topP: sessionConfig.topP,
                    maxTokens: sessionConfig.maxTokens,
                    systemPrompt: sessionConfig.systemPrompt,
                });
                for await (const chunk of stream) {
                    fullContent += chunk.content;
                    setStreamContent(fullContent);
                    if (chunk.tokens) {
                        setTokenUsage(chunk.tokens);
                    }
                }
                // Add final assistant message
                const assistantMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: fullContent,
                    timestamp: Date.now(),
                    tokens: tokenUsage ?? undefined,
                };
                setConversation(prev => ({
                    ...prev,
                    messages: [...prev.messages, assistantMessage],
                    updatedAt: Date.now(),
                }));
                setIsStreaming(false);
                setStreamContent('');
            }
            else {
                // ── Non-Streaming Mode ──
                const response = await provider.chat(allMessages, {
                    temperature: sessionConfig.temperature,
                    topP: sessionConfig.topP,
                    maxTokens: sessionConfig.maxTokens,
                    systemPrompt: sessionConfig.systemPrompt,
                });
                const assistantMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: response.content,
                    timestamp: Date.now(),
                    tokens: response.tokens ?? undefined,
                };
                setConversation(prev => ({
                    ...prev,
                    messages: [...prev.messages, assistantMessage],
                    updatedAt: Date.now(),
                }));
                if (response.tokens) {
                    setTokenUsage(response.tokens);
                }
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg);
            addOutput(chalk.hex('#ff4444')(`Request failed: ${msg}`));
        }
        finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    }, [provider, sessionConfig, tokenUsage, addOutput]);
    // ─── Submit Input ───
    const submitInput = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed)
            return;
        if (multilineMode) {
            // In multiline mode, accumulate lines
            if (trimmed === 'END_MULTILINE') {
                // Send accumulated buffer
                setMultilineMode(false);
                if (multilineBuffer.trim()) {
                    processUserInput(multilineBuffer.trim());
                }
                setMultilineBuffer('');
            }
            else {
                setMultilineBuffer(prev => prev + (prev ? '\n' : '') + trimmed);
            }
        }
        else if (trimmed.startsWith('/')) {
            handleCommand(trimmed);
        }
        else {
            processUserInput(trimmed);
        }
        setInput('');
    }, [input, multilineMode, multilineBuffer, handleCommand, processUserInput]);
    // ─── Keyboard Input ───
    useInput((rawInput, key) => {
        if (key.escape) {
            if (multilineMode) {
                setMultilineMode(false);
                setMultilineBuffer('');
                addOutput(chalk.dim('Multiline mode cancelled.'));
            }
            return;
        }
        if (key.return) {
            submitInput();
            return;
        }
        if (key.backspace || key.delete) {
            setInput(prev => prev.slice(0, -1));
            return;
        }
        if (rawInput && !key.ctrl && !key.meta) {
            setInput(prev => prev + rawInput);
        }
    });
    // ─── Calculate context max ───
    const contextMax = (() => {
        const defaults = PROVIDER_DEFAULTS[sessionConfig.provider];
        const modelInfo = defaults?.models.find(m => m.id === sessionConfig.model);
        return modelInfo?.contextWindow ?? 8192;
    })();
    const isLastMessageAssistant = conversation.messages.length > 0 &&
        conversation.messages[conversation.messages.length - 1].role === 'assistant';
    // ─── Render ───
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Header, { provider: sessionConfig.provider, model: sessionConfig.model, endpoint: PROVIDER_DEFAULTS[sessionConfig.provider]?.baseUrl ?? 'unknown', profile: sessionConfig.profile, connected: connected }), showMascot && _jsx(ShibaMascot, { show: showMascot }), outputLines.map((line, i) => (_jsx(Text, { children: line.text }, i))), conversation.messages.map((msg, idx) => (_jsx(MessageItem, { message: msg, isLast: idx === conversation.messages.length - 1, streaming: isStreaming && isLastMessageAssistant, streamContent: streamContent }, msg.id))), isStreaming && streamContent && !isLastMessageAssistant && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { children: chalk.hex('#44aaff')('[AI] ') }), _jsxs(Text, { wrap: "wrap", children: [streamContent, CURSOR] })] })), (isLoading || isStreaming) && (_jsx(Spinner, { text: isStreaming ? 'Generating response...' : 'Thinking...', active: true })), error && (_jsx(Text, { color: "red", children: error })), multilineMode && (_jsx(Text, { dimColor: true, children: chalk.dim('─── MULTILINE MODE (type END_MULTILINE to send, ESC to cancel) ───') })), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: [multilineMode ? chalk.hex('#ffcc00')('>> ') : PROMPT_SYMBOL, input, CURSOR] }) }), _jsx(Statusbar, { tokens: tokenUsage, contextMax: contextMax, streaming: isStreaming, connected: connected }), _jsx(Text, { dimColor: true, children: "openshiba v1.0.0" })] }));
}
//# sourceMappingURL=repl.js.map