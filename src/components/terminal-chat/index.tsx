import { useGet } from 'getrx';
import { Box, useApp } from 'ink';
import React, { useEffect } from 'react';
import Header from '@/components/header';
import ChatInput from '@/components/chat-input';
import { ChatController } from '@/controllers/chat';
import ChatMessage from '@/components/chat-message';
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
}: TerminalChatProps): React.ReactElement {
  const chatController = useGet(ChatController);
  const { exit } = useApp();

  useEffect(() => {
    chatController.setExitFn(exit);
  }, [chatController, exit]);

  const modelId = config.defaultModel;
  const displayMessages = chatController.displayMessages.use()!;
  const loading = chatController.loading.use();
  const streamingText = chatController.streamingText.use();
  const streamingReasoning = chatController.streamingReasoning.use();
  const reasoningVisible = chatController.reasoningVisible.use();
  const pendingToolCall = chatController.pendingToolCall.use();
  const overlay = chatController.overlay.use();
  const inputHistory = chatController.inputHistory.use()!;
  const isInputActive = chatController.isInputActive;

  return (
    <Box flexDirection="column" width="100%">
      <Header modelId={modelId} version={version} />

      <MessageHistory messages={displayMessages} />

      {loading && reasoningVisible && streamingReasoning && (
        <ThinkingStream content={streamingReasoning} />
      )}

      {loading && streamingText && (
        <Box flexDirection="column" marginBottom={1}>
          <ChatMessage
            message={{ id: 'streaming', role: 'assistant', content: streamingText }}
          />
        </Box>
      )}

      {loading && !streamingText && !pendingToolCall && <SpinnerMessage />}

      {pendingToolCall && (
        <ToolCallReview toolCall={pendingToolCall} onDecision={(decision) => chatController.applyToolDecision(decision)} />
      )}

      {overlay === 'model-selector' && (
        <ModelSelector
          config={config}
          currentModelId={modelId}
          onSelect={(newModelId) => chatController.switchModel(newModelId)}
          onCancel={() => chatController.dismissOverlay()}
        />
      )}

      {overlay === 'help' && (
        <HelpDisplay onDismiss={() => chatController.dismissOverlay()} />
      )}

      {overlay === 'config-setup' && (
        <ConfigSetup config={config} onComplete={(newConfig) => chatController.saveConfig(newConfig)} />
      )}

      <ChatInput
        onSubmit={(text) => chatController.sendMessage(text)}
        onSlashCommand={(command) => chatController.processSlashCommand(command)}
        isActive={isInputActive}
        history={inputHistory}
      />
    </Box>
  );
}
