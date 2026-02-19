import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { COLORS } from '@/utils/colors';
import type { SpinnerMessageProps } from '@/components/spinner-message/types';

export default function SpinnerMessage({ text = 'Thinking...' }: SpinnerMessageProps): React.ReactElement {
  return (
    <Box gap={1} marginLeft={2}>
      <Text color={COLORS.accent}>
        <Spinner type="dots" />
      </Text>
      <Text dimColor>{text}</Text>
    </Box>
  );
}
