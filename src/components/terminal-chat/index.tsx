import { useGet } from 'getrx';
import { Box, useApp } from 'ink';
import React, { useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import Header from '@/components/header';
import ChatInput from '@/components/chat-input';
import { ChatController } from '@/controllers/chat';
import ConfigSetup from '@/components/config-setup';
import HelpDisplay from '@/components/help-display';
import ModelSelector from '@/components/model-selector';
import MessageHistory from '@/components/message-history';
import SpinnerMessage from '@/components/spinner-message';
import ThinkingStream from '@/components/thinking-stream';
import ToolCallReview from '@/components/tool-call-review';
import type { TerminalChatProps } from '@/components/terminal-chat/types';

export default function TerminalChat({
  config,
  version,
  port,
  token,
}: TerminalChatProps): React.ReactElement {
  const chatController = useGet(ChatController);
  const { exit } = useApp();
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `http://127.0.0.1:${port}/api/chat`,
        headers: {
          'X-Chat-Token': token,
        },
      }),
    [port, token],
  );
  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
  });

  useEffect(() => {
    chatController.setExitFn(exit);
  }, [chatController, exit]);

  const modelId = config.defaultModel;
  const displayMessages = useMemo(
    () => chatController.messages.toDisplayMessages(messages),
    [chatController, messages],
  );
  const loading = status === 'submitted' || status === 'streaming';
  const isSubmitting = status === 'submitted';
  const streamingReasoning = chatController.messages.getStreamingReasoning(messages);
  const reasoningVisible = !!streamingReasoning;
  const pendingToolCall = chatController.toolApproval.pendingToolCall.use();
  const overlay = chatController.ui.overlay.use();
  const inputHistory = useMemo(
    () =>
      displayMessages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .reverse(),
    [displayMessages],
  );
  const isInputActive = !loading && !pendingToolCall && overlay === 'none';

  useEffect(() => {
    chatController.messages.bindSetMessages(setMessages);
  }, [chatController, setMessages]);

  useEffect(() => {
    chatController.messages.sync(messages);
  }, [chatController, messages]);

  return (
    <Box flexDirection="column" width="100%">
      <Header modelId={modelId} version={version} />

      <MessageHistory messages={displayMessages} />

      {loading && reasoningVisible && <ThinkingStream content={streamingReasoning} />}

      {isSubmitting && !pendingToolCall && <SpinnerMessage />}

      {pendingToolCall && (
        <ToolCallReview
          toolCall={pendingToolCall}
          onDecision={(decision) => chatController.toolApproval.apply(decision)}
        />
      )}

      {overlay === 'model-selector' && (
        <ModelSelector
          config={config}
          currentModelId={modelId}
          onSelect={(newModelId) => chatController.switchModel(newModelId)}
          onCancel={() => chatController.ui.dismissOverlay()}
        />
      )}

      {overlay === 'help' && <HelpDisplay onDismiss={() => chatController.ui.dismissOverlay()} />}

      {overlay === 'config-setup' && (
        <ConfigSetup
          config={config}
          onComplete={(newConfig) => chatController.saveConfig(newConfig)}
        />
      )}

      <ChatInput
        onSubmit={(text) => {
          void sendMessage({ text });
        }}
        onSlashCommand={(command) => chatController.processSlashCommand(command)}
        isActive={isInputActive}
        history={inputHistory}
      />
    </Box>
  );
}
