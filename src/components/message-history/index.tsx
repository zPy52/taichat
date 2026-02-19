import React from 'react';
import { Box, Static } from 'ink';
import ChatMessage from '@/components/chat-message';
import type { MessageHistoryProps } from '@/components/message-history/types';

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
