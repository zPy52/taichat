import React from 'react';
import { Box } from 'ink';
import { Tools } from '@/tools';
import ChatMessage from '@/components/chat-message';
import type { MessageHistoryProps } from '@/components/message-history/types';

function areMessagesEqual(
  prev: MessageHistoryProps['messages'],
  next: MessageHistoryProps['messages'],
): boolean {
  if (prev === next) {
    return true;
  }

  if (prev.length !== next.length) {
    return false;
  }

  return prev.every((prevMessage, index) => {
    const nextMessage = next[index];
    return (
      prevMessage.id === nextMessage.id &&
      prevMessage.role === nextMessage.role &&
      prevMessage.content === nextMessage.content &&
      prevMessage.toolName === nextMessage.toolName &&
      Tools.utils.hasSameArgs(prevMessage.toolArgs, nextMessage.toolArgs)
    );
  });
}

function MessageHistoryComponent({ messages }: MessageHistoryProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      {messages.map((message) => (
        <Box key={message.id} flexDirection="column" marginBottom={1}>
          <ChatMessage message={message} />
        </Box>
      ))}
    </Box>
  );
}

const MessageHistory = React.memo(MessageHistoryComponent, (prevProps, nextProps) =>
  areMessagesEqual(prevProps.messages, nextProps.messages),
);

MessageHistory.displayName = 'MessageHistory';

export default MessageHistory;
