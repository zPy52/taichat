import React from 'react';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import type { HelpDisplayProps } from '@/components/help-display/types';

export default function HelpDisplay(_props: HelpDisplayProps): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={Const.colors.accent}
      paddingX={1}
      marginY={1}
    >
      <Box marginBottom={1}>
        <Text bold color={Const.colors.accent}>TaiChat Help</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold dimColor>Slash Commands:</Text>
        {Const.commands.map((command) => (
          <Box key={command.cmd} gap={1} marginLeft={1}>
            <Text color={Const.colors.accent}>{command.cmd.padEnd(10)}</Text>
            <Text dimColor>{command.desc}</Text>
          </Box>
        ))}
      </Box>

      <Box flexDirection="column">
        <Text bold dimColor>Shortcuts:</Text>
        {Const.shortcuts.map((shortcut) => (
          <Box key={shortcut.key} gap={1} marginLeft={1}>
            <Text color={Const.colors.accent}>{shortcut.key.padEnd(10)}</Text>
            <Text dimColor>{shortcut.desc}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>(/help again to hide)</Text>
      </Box>
    </Box>
  );
}
