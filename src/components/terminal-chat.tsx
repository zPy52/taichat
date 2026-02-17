import React, { useState, useCallback, useRef } from 'react';
import { Box, useApp } from 'ink';
import type { ModelMessage } from 'ai';
import Header from '@/components/header';
import MessageHistory from '@/components/message-history';
import ChatMessage, { type ChatMessageData } from '@/components/chat-message';
import ChatInput from '@/components/chat-input';
import SpinnerMessage from '@/components/spinner-message';
import ToolCallReview, { type ReviewDecision } from '@/components/tool-call-review';
import ModelSelector from '@/components/model-selector';
import HelpDisplay from '@/components/help-display';
import ConfigSetup from '@/components/config-setup';
import { runAgent, type PendingToolCall, type ToolApprovalStatus } from '@/agent';
import { type AppConfig, saveConfig, getApiKey } from '@/config';

type OverlayMode = 'none' | 'model-selector' | 'help' | 'config-setup';

interface TerminalChatProps {
  config: AppConfig;
  version: string;
}

let messageCounter = 0;
function nextId(): string {
  return `msg-${++messageCounter}`;
}

export default function TerminalChat({
  config: initialConfig,
  version,
}: TerminalChatProps): React.ReactElement {
  const app = useApp();
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [modelId, setModelId] = useState(config.defaultModel);
  const [displayMessages, setDisplayMessages] = useState<ChatMessageData[]>([]);
  const [coreMessages, setCoreMessages] = useState<ModelMessage[]>([]);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [pendingToolCall, setPendingToolCall] = useState<PendingToolCall | null>(null);
  const [overlay, setOverlay] = useState<OverlayMode>('none');
  const approvalResolverRef = useRef<((decision: ToolApprovalStatus) => void) | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (text: string) => {
      if (loading) return;

      const userMsg: ChatMessageData = { id: nextId(), role: 'user', content: text };
      setDisplayMessages((prev) => [...prev, userMsg]);
      setInputHistory((prev) => [text, ...prev]);

      const newCoreMessages: ModelMessage[] = [...coreMessages, { role: 'user', content: text }];
      setCoreMessages(newCoreMessages);

      setLoading(true);
      setStreamingText('');

      const exaKey = getApiKey('exa', config);
      if (exaKey) {
        process.env.EXA_API_KEY = exaKey;
      }

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const updatedMessages = await runAgent(newCoreMessages, modelId, config, {
          onTextDelta: (delta) => {
            setStreamingText((prev) => prev + delta);
          },
          onToolCall: (tc) => {
            setStreamingText((prev) => {
              if (prev) {
                const assistantMsg: ChatMessageData = {
                  id: nextId(),
                  role: 'assistant',
                  content: prev,
                };
                setDisplayMessages((msgs) => [...msgs, assistantMsg]);
              }
              return '';
            });

            const toolMsg: ChatMessageData = {
              id: nextId(),
              role: 'tool-call',
              content: '',
              toolName: tc.toolName,
              toolArgs: tc.args,
            };
            setDisplayMessages((prev) => [...prev, toolMsg]);
          },
          onToolResult: (_toolCallId, toolName, result) => {
            const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
            const resultMsg: ChatMessageData = {
              id: nextId(),
              role: 'tool-result',
              content,
              toolName,
            };
            setDisplayMessages((prev) => [...prev, resultMsg]);
            setPendingToolCall(null);
          },
          onFinish: () => {
            setStreamingText((prev) => {
              if (prev) {
                const assistantMsg: ChatMessageData = {
                  id: nextId(),
                  role: 'assistant',
                  content: prev,
                };
                setDisplayMessages((msgs) => [...msgs, assistantMsg]);
              }
              return '';
            });
            setLoading(false);
          },
          onError: (error) => {
            const errorMsg: ChatMessageData = {
              id: nextId(),
              role: 'assistant',
              content: `Error: ${error.message}`,
            };
            setDisplayMessages((prev) => [...prev, errorMsg]);
            setLoading(false);
          },
          requestToolApproval: (tc) => {
            setPendingToolCall(tc);
            return new Promise<ToolApprovalStatus>((resolve) => {
              approvalResolverRef.current = resolve;
            });
          },
        }, abortController.signal);

        setCoreMessages(updatedMessages);
      } catch (err) {
        if (!abortController.signal.aborted) {
          const errorMsg: ChatMessageData = {
            id: nextId(),
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          };
          setDisplayMessages((prev) => [...prev, errorMsg]);
        }
        setLoading(false);
      }
    },
    [loading, coreMessages, modelId, config],
  );

  const handleToolDecision = useCallback((decision: ReviewDecision) => {
    if (approvalResolverRef.current) {
      approvalResolverRef.current(decision);
      approvalResolverRef.current = null;
    }
    setPendingToolCall(null);
  }, []);

  const handleSlashCommand = useCallback(
    (command: string) => {
      switch (command) {
        case '/model':
          setOverlay('model-selector');
          break;
        case '/clear':
          setDisplayMessages([]);
          setCoreMessages([]);
          setStreamingText('');
          break;
        case '/config':
          setOverlay('config-setup');
          break;
        case '/help':
          setOverlay('help');
          break;
        case '/exit':
        case '/quit':
          app.exit();
          break;
        default: {
          const unknownMsg: ChatMessageData = {
            id: nextId(),
            role: 'assistant',
            content: `Unknown command: ${command}. Type /help for available commands.`,
          };
          setDisplayMessages((prev) => [...prev, unknownMsg]);
        }
      }
    },
    [app],
  );

  const handleModelSelect = useCallback(
    (newModelId: string) => {
      setModelId(newModelId);
      const newConfig = { ...config, defaultModel: newModelId };
      setConfig(newConfig);
      saveConfig(newConfig);

      const switchMsg: ChatMessageData = {
        id: nextId(),
        role: 'assistant',
        content: `Switched to model: ${newModelId}`,
      };
      setDisplayMessages((prev) => [...prev, switchMsg]);
      setOverlay('none');
    },
    [config],
  );

  const handleConfigComplete = useCallback(
    (newConfig: AppConfig) => {
      setConfig(newConfig);
      saveConfig(newConfig);
      setOverlay('none');

      const configMsg: ChatMessageData = {
        id: nextId(),
        role: 'assistant',
        content: 'Configuration saved.',
      };
      setDisplayMessages((prev) => [...prev, configMsg]);
    },
    [],
  );

  const isInputActive = !loading && !pendingToolCall && overlay === 'none';

  return (
    <Box flexDirection="column" width="100%">
      <Header modelId={modelId} version={version} />

      <MessageHistory messages={displayMessages} />

      {loading && streamingText && (
        <Box flexDirection="column" marginBottom={1}>
          <ChatMessage
            message={{ id: 'streaming', role: 'assistant', content: streamingText }}
          />
        </Box>
      )}

      {loading && !streamingText && !pendingToolCall && <SpinnerMessage />}

      {pendingToolCall && (
        <ToolCallReview toolCall={pendingToolCall} onDecision={handleToolDecision} />
      )}

      {overlay === 'model-selector' && (
        <ModelSelector
          config={config}
          currentModelId={modelId}
          onSelect={handleModelSelect}
          onCancel={() => setOverlay('none')}
        />
      )}

      {overlay === 'help' && <HelpDisplay onDismiss={() => setOverlay('none')} />}

      {overlay === 'config-setup' && (
        <ConfigSetup config={config} onComplete={handleConfigComplete} />
      )}

      <ChatInput
        onSubmit={handleSubmit}
        onSlashCommand={handleSlashCommand}
        isActive={isInputActive}
        history={inputHistory}
      />
    </Box>
  );
}
