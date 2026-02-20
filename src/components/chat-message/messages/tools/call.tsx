import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import { Tools } from '@/tools';
import Spinner from 'ink-spinner';
import type { ToolCallMessageProps } from '@/components/chat-message/types';

export function ToolCallMessage({ toolName, toolArgs }: ToolCallMessageProps): React.ReactElement {
  const text = Tools.utils.getPendingText(toolName, toolArgs);

  return (
    <Box marginLeft={2} gap={1}>
      <Text color={Const.colors.accent}>
        <Spinner type="arc" />
      </Text>
      <Text dimColor>{text}</Text>
    </Box>
  );
}
