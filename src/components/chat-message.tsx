import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import { renderMarkdown } from '@/utils/markdown';

export type MessageRole = 'user' | 'assistant' | 'tool-call' | 'tool-result';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps): React.ReactElement {
  switch (message.role) {
    case 'user':
      return (
        <Box flexDirection="column" marginY={0}>
          <Box gap={1}>
            <Text bold color={COLORS.userPrompt}>{'>'}</Text>
            <Text bold color={COLORS.userPrompt}>You</Text>
          </Box>
          <Box marginLeft={2}>
            <Text>{message.content}</Text>
          </Box>
        </Box>
      );

    case 'assistant':
      return (
        <Box flexDirection="column" marginY={0}>
          <Box gap={1}>
            <Text bold color={COLORS.assistantLabel}>{'●'}</Text>
            <Text bold color={COLORS.assistantLabel}>TermiChat</Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <Text>{renderMarkdown(message.content)}</Text>
          </Box>
        </Box>
      );

    case 'tool-call':
      return (
        <Box marginLeft={2} gap={1}>
          <Text color={COLORS.toolLabel}>{'⚡'}</Text>
          <Text color={COLORS.toolLabel} bold>
            {message.toolName}
          </Text>
          <Text dimColor>
            {formatToolArgs(message.toolArgs)}
          </Text>
        </Box>
      );

    case 'tool-result':
      return (
        <Box marginLeft={2} flexDirection="column">
          <Box gap={1}>
            <Text color={COLORS.success}>{'✓'}</Text>
            <Text color={COLORS.success} dimColor>
              {message.toolName} result
            </Text>
          </Box>
          {message.content && (
            <Box marginLeft={2}>
              <Text dimColor>{truncate(message.content, 500)}</Text>
            </Box>
          )}
        </Box>
      );

    default:
      return <Text>{message.content}</Text>;
  }
}

function formatToolArgs(args?: Record<string, unknown>): string {
  if (!args) return '';
  const entries = Object.entries(args);
  if (entries.length === 0) return '';
  return entries
    .map(([k, v]) => {
      const val = typeof v === 'string' ? truncate(v, 60) : JSON.stringify(v);
      return `${k}=${val}`;
    })
    .join(' ');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
