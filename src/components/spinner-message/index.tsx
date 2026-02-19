import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import Spinner from 'ink-spinner';
import type { SpinnerMessageProps } from '@/components/spinner-message/types';

export default function SpinnerMessage({ text = 'Thinking...' }: SpinnerMessageProps): React.ReactElement {
  return (
    <Box gap={1} marginLeft={2}>
      <Text color={Const.colors.accent}>
        <Spinner type="dots" />
      </Text>
      <Text dimColor>{text}</Text>
    </Box>
  );
}
