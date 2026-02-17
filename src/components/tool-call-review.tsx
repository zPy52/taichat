import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { COLORS } from '@/utils/colors';
import type { PendingToolCall } from '@/agent';

export type ReviewDecision = 'approved' | 'denied';

interface ToolCallReviewProps {
  toolCall: PendingToolCall;
  onDecision: (decision: ReviewDecision) => void;
}

const TOOL_DESCRIPTIONS: Record<string, string> = {
  write_file: 'Write to a file',
  remove_file: 'Delete a file',
  execute_command: 'Execute a shell command',
};

export default function ToolCallReview({
  toolCall,
  onDecision,
}: ToolCallReviewProps): React.ReactElement {
  const description = TOOL_DESCRIPTIONS[toolCall.toolName] || toolCall.toolName;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={COLORS.warning}
      paddingX={1}
      marginY={1}
    >
      <Box gap={1} marginBottom={1}>
        <Text color={COLORS.warning} bold>
          {'⚠'}
        </Text>
        <Text color={COLORS.warning} bold>
          Tool Approval Required
        </Text>
      </Box>

      <Box flexDirection="column" marginLeft={2} marginBottom={1}>
        <Box gap={1}>
          <Text dimColor>tool:</Text>
          <Text color={COLORS.toolLabel} bold>
            {description}
          </Text>
        </Box>
        {renderArgs(toolCall)}
      </Box>

      <Box marginLeft={2}>
        <Text>Allow this action?</Text>
      </Box>

      <Box marginLeft={2}>
        <Select
          options={[
            { label: 'Yes, allow (y)', value: 'approved' },
            { label: 'No, deny (n)', value: 'denied' },
          ]}
          onChange={(value) => {
            onDecision(value as ReviewDecision);
          }}
        />
      </Box>
    </Box>
  );
}

function renderArgs(toolCall: PendingToolCall): React.ReactElement | null {
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
            <Text dimColor>
              {truncate(String(args.content || ''), 200)}
            </Text>
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

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
