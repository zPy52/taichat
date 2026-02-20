import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import type { UserMessageProps } from '@/components/chat-message/types';

export function UserMessage({ content }: UserMessageProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginY={0}>
      <Box gap={1}>
        <Text bold color={Const.colors.userPrompt}>{'>'}</Text>
        <Text bold color={Const.colors.userPrompt}>You</Text>
      </Box>
      <Box marginLeft={2}>
        <Text>{content}</Text>
      </Box>
    </Box>
  );
}
