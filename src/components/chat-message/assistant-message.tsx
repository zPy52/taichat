import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import { renderMarkdown } from '@/utils/markdown';
import type { AssistantMessageProps } from '@/components/chat-message/types';

export function AssistantMessage({ content }: AssistantMessageProps): React.ReactElement {
  const renderedContent = renderMarkdown(content);

  return (
    <Box flexDirection="column" marginY={0}>
      <Box gap={1}>
        <Text bold color={COLORS.assistantLabel}>{'●'}</Text>
        <Text bold color={COLORS.assistantLabel}>TaiChat</Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        <Text>{renderedContent}</Text>
      </Box>
    </Box>
  );
}
