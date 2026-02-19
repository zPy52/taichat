import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';
import type { HelpDisplayProps } from '@/components/help-display/types';

const COMMANDS = [
  { cmd: '/model', desc: 'Switch the active AI model' },
  { cmd: '/clear', desc: 'Clear the chat history' },
  { cmd: '/copy', desc: 'Copy the last assistant message' },
  { cmd: '/config', desc: 'Re-configure API keys' },
  { cmd: '/help', desc: 'Show this help message' },
];

const SHORTCUTS = [
  { key: 'Enter', desc: 'Send message' },
  { key: 'Up/Down', desc: 'Navigate message history' },
  { key: 'Ctrl+C', desc: 'Exit TaiChat' },
];

export default function HelpDisplay({ onDismiss }: HelpDisplayProps): React.ReactElement {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={COLORS.accent}
      paddingX={1}
      marginY={1}
    >
      <Box marginBottom={1}>
        <Text bold color={COLORS.accent}>TaiChat Help</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold dimColor>Slash Commands:</Text>
        {COMMANDS.map((command) => (
          <Box key={command.cmd} gap={1} marginLeft={1}>
            <Text color={COLORS.accent}>{command.cmd.padEnd(10)}</Text>
            <Text dimColor>{command.desc}</Text>
          </Box>
        ))}
      </Box>

      <Box flexDirection="column">
        <Text bold dimColor>Shortcuts:</Text>
        {SHORTCUTS.map((shortcut) => (
          <Box key={shortcut.key} gap={1} marginLeft={1}>
            <Text color={COLORS.accent}>{shortcut.key.padEnd(10)}</Text>
            <Text dimColor>{shortcut.desc}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>(auto-dismiss in 10s, or type to continue)</Text>
      </Box>
    </Box>
  );
}
