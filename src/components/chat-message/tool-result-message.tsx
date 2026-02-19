import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import type { ToolResultMessageProps } from '@/components/chat-message/types';
import { truncate } from '@/components/chat-message/utils';

export function ToolResultMessage({ toolName, content }: ToolResultMessageProps): React.ReactElement {
  const truncatedContent = content ? truncate(content, 500) : '';

  return (
    <Box marginLeft={2} flexDirection="column">
      <Box gap={1}>
        <Text color={COLORS.success}>{'✓'}</Text>
        <Text color={COLORS.success} dimColor>
          {toolName} result
        </Text>
      </Box>
      {content && (
        <Box marginLeft={2}>
          <Text dimColor>{truncatedContent}</Text>
        </Box>
      )}
    </Box>
  );
}
