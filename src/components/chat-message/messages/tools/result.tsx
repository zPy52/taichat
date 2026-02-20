import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import { Tools } from '@/tools';
import type { ToolResultMessageProps } from '@/components/chat-message/types';

export function ToolResultMessage({
  toolName,
  content,
  toolArgs,
}: ToolResultMessageProps): React.ReactElement {
  const hasError = Tools.utils.hasResultError(content);
  const text = Tools.utils.getCompletedText(toolName, toolArgs);
  const statusText = hasError ? `${text} (failed)` : text;
  const color = hasError ? Const.colors.danger : Const.colors.success;
  const icon = hasError ? '✗' : '✓';

  return (
    <Box marginLeft={2} gap={1}>
      <Text color={color}>{icon}</Text>
      <Text dimColor>{statusText}</Text>
    </Box>
  );
}
