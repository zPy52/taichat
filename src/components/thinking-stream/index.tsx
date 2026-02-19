import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import { useSpinnerFrames } from '@/components/thinking-stream/hooks';
import type { ThinkingStreamProps } from '@/components/thinking-stream/types';

export default function ThinkingStream({ content }: ThinkingStreamProps): React.ReactElement {
  const currentFrame = useSpinnerFrames();

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text bold color={Const.colors.accent}>
          {currentFrame}
        </Text>
        <Text bold color={Const.colors.accent}>
          Thinking
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text color={Const.colors.dimText}>{content}</Text>
      </Box>
    </Box>
  );
}
