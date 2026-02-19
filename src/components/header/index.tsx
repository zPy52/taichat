import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import { AiProviderService } from '@/services/providers';
import type { HeaderProps } from '@/components/header/types';

export default function Header({ modelId, version }: HeaderProps): React.ReactElement {
  const modelLabel = AiProviderService.label(modelId);

  return (
    <Box
      flexDirection="column"
      borderStyle="bold"
      borderColor={Const.colors.accentDim}
      paddingX={1}
      marginBottom={1}
    >
      <Box gap={1}>
        <Text bold color={Const.colors.accent}>
          {'>'}_
        </Text>
        <Text bold color={Const.colors.accent}>
          TaiChat
        </Text>
        <Text dimColor>
          (v{version})
        </Text>
      </Box>
      <Box gap={1}>
        <Text color={Const.colors.dimText}>{'|'}</Text>
        <Text dimColor>model:</Text>
        <Text color={Const.colors.success}>{modelLabel}</Text>
        <Text dimColor>/model to change</Text>
      </Box>
      <Box gap={1}>
        <Text color={Const.colors.dimText}>{'|'}</Text>
        <Text dimColor>directory:</Text>
        <Text>{process.cwd()}</Text>
      </Box>
    </Box>
  );
}
