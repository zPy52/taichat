import React from 'react';
import { Box, Static } from 'ink';
import ChatMessage, { type ChatMessageData } from '@/components/chat-message';

interface MessageHistoryProps {
  messages: ChatMessageData[];
}

export default function MessageHistory({ messages }: MessageHistoryProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Static items={messages}>
        {(message) => (
          <Box key={message.id} flexDirection="column" marginBottom={1}>
            <ChatMessage message={message} />
          </Box>
        )}
      </Static>
    </Box>
  );
}
