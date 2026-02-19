import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import type { ToolCallMessageProps } from '@/components/chat-message/types';
import { formatToolArgs } from '@/components/chat-message/utils';

export function ToolCallMessage({ toolName, toolArgs }: ToolCallMessageProps): React.ReactElement {
  const argsText = formatToolArgs(toolArgs);

  return (
    <Box marginLeft={2} gap={1}>
      <Text color={COLORS.toolLabel}>{'⚡'}</Text>
      <Text color={COLORS.toolLabel} bold>
        {toolName}
      </Text>
      <Text dimColor>{argsText}</Text>
    </Box>
  );
}
