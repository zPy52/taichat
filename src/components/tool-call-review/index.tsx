import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import { Select } from '@inkjs/ui';
import { ToolCallArgs } from '@/components/tool-call-review/tool-call-args';
import type { ReviewDecision, ToolCallReviewProps } from '@/components/tool-call-review/types';

export type { ReviewDecision } from '@/components/tool-call-review/types';

const TOOL_DESCRIPTIONS: Record<string, string> = {
  write_file: 'Write to a file',
  remove_file: 'Delete a file',
  execute_command: 'Execute a shell command',
};

const REVIEW_OPTIONS = [
  { label: 'Yes, allow (y)', value: 'approved' },
  { label: 'No, deny (n)', value: 'denied' },
];

export default function ToolCallReview({
  toolCall,
  onDecision,
}: ToolCallReviewProps): React.ReactElement {
  const description = TOOL_DESCRIPTIONS[toolCall.toolName] || toolCall.toolName;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={Const.colors.warning}
      paddingX={1}
      marginY={1}
    >
      <Box gap={1} marginBottom={1}>
        <Text color={Const.colors.warning} bold>
          {'⚠'}
        </Text>
        <Text color={Const.colors.warning} bold>
          Tool Approval Required
        </Text>
      </Box>

      <Box flexDirection="column" marginLeft={2} marginBottom={1}>
        <Box gap={1}>
          <Text dimColor>tool:</Text>
          <Text color={Const.colors.toolLabel} bold>
            {description}
          </Text>
        </Box>
        <ToolCallArgs toolCall={toolCall} />
      </Box>

      <Box marginLeft={2}>
        <Text>Allow this action?</Text>
      </Box>

      <Box marginLeft={2}>
        <Select
          options={REVIEW_OPTIONS}
          onChange={(value) => {
            onDecision(value as ReviewDecision);
          }}
        />
      </Box>
    </Box>
  );
}
