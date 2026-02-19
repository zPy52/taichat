import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import type { ToolCallArgsProps } from '@/components/tool-call-review/types';

export function ToolCallArgs({ toolCall }: ToolCallArgsProps): React.ReactElement | null {
  const args = toolCall.args;

  switch (toolCall.toolName) {
    case 'write_file':
      return (
        <Box flexDirection="column">
          <Box gap={1}>
            <Text dimColor>path:</Text>
            <Text>{String(args.filePath || '')}</Text>
          </Box>
          <Box gap={1}>
            <Text dimColor>content:</Text>
            <Text dimColor>{truncate(String(args.content || ''), 200)}</Text>
          </Box>
        </Box>
      );
    case 'remove_file':
      return (
        <Box gap={1}>
          <Text dimColor>path:</Text>
          <Text color={COLORS.danger}>{String(args.filePath || '')}</Text>
        </Box>
      );
    case 'execute_command':
      return (
        <Box flexDirection="column">
          <Box gap={1}>
            <Text dimColor>$</Text>
            <Text>{String(args.command || '')}</Text>
          </Box>
          {args.cwd ? (
            <Box gap={1}>
              <Text dimColor>cwd:</Text>
              <Text dimColor>{String(args.cwd)}</Text>
            </Box>
          ) : null}
        </Box>
      );
    default:
      return (
        <Box>
          <Text dimColor>{JSON.stringify(args, null, 2)}</Text>
        </Box>
      );
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
}
