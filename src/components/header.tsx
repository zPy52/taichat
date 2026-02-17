import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import { getModelLabel } from '@/providers';

interface HeaderProps {
  modelId: string;
  version: string;
}

export default function Header({ modelId, version }: HeaderProps): React.ReactElement {
  const modelLabel = getModelLabel(modelId);

  return (
    <Box
      flexDirection="column"
      borderStyle="bold"
      borderColor={COLORS.accentDim}
      paddingX={1}
      marginBottom={1}
    >
      <Box gap={1}>
        <Text bold color={COLORS.accent}>
          {'>'}_
        </Text>
        <Text bold color={COLORS.accent}>
          TermiChat
        </Text>
        <Text dimColor>
          (v{version})
        </Text>
      </Box>
      <Box gap={1}>
        <Text color={COLORS.dimText}>{'|'}</Text>
        <Text dimColor>model:</Text>
        <Text color={COLORS.success}>{modelLabel}</Text>
        <Text dimColor>/model to change</Text>
      </Box>
      <Box gap={1}>
        <Text color={COLORS.dimText}>{'|'}</Text>
        <Text dimColor>directory:</Text>
        <Text>{process.cwd()}</Text>
      </Box>
    </Box>
  );
}
