import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import type { ToolCallMessageProps } from '@/components/chat-message/types';
import { formatToolArgs } from '@/components/chat-message/utils';

export function ToolCallMessage({ toolName, toolArgs }: ToolCallMessageProps): React.ReactElement {
  const argsText = formatToolArgs(toolArgs);

  return (
    <Box marginLeft={2} gap={1}>
      <Text color={Const.colors.toolLabel}>{'⚡'}</Text>
      <Text color={Const.colors.toolLabel} bold>
        {toolName}
      </Text>
      <Text dimColor>{argsText}</Text>
    </Box>
  );
}
