import React from 'react';
import { Box, Text } from 'ink';
import { COLORS } from '@/utils/colors';

interface HelpDisplayProps {
  onDismiss: () => void;
}

const COMMANDS = [
  { cmd: '/model', desc: 'Switch the active AI model' },
  { cmd: '/clear', desc: 'Clear the chat history' },
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
        {COMMANDS.map((c) => (
          <Box key={c.cmd} gap={1} marginLeft={1}>
            <Text color={COLORS.accent}>{c.cmd.padEnd(10)}</Text>
            <Text dimColor>{c.desc}</Text>
          </Box>
        ))}
      </Box>

      <Box flexDirection="column">
        <Text bold dimColor>Shortcuts:</Text>
        {SHORTCUTS.map((s) => (
          <Box key={s.key} gap={1} marginLeft={1}>
            <Text color={COLORS.accent}>{s.key.padEnd(10)}</Text>
            <Text dimColor>{s.desc}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>(auto-dismiss in 10s, or type to continue)</Text>
      </Box>
    </Box>
  );
}
