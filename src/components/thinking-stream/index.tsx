import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import { useSpinnerFrames } from '@/components/thinking-stream/hooks';
import type { ThinkingStreamProps } from '@/components/thinking-stream/types';

export default function ThinkingStream({ content }: ThinkingStreamProps): React.ReactElement {
  const currentFrame = useSpinnerFrames();

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text bold color={COLORS.accent}>
          {currentFrame}
        </Text>
        <Text bold color={COLORS.accent}>
          Thinking
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text color={COLORS.dimText}>{content}</Text>
      </Box>
    </Box>
  );
}
