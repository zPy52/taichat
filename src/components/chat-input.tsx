import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from '@inkjs/ui';
import { COLORS } from '@/utils/colors';

export interface SlashCommand {
  command: string;
  description: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  { command: '/model', description: 'Switch the active model' },
  { command: '/clear', description: 'Clear chat history' },
  { command: '/config', description: 'Re-run API key setup' },
  { command: '/help', description: 'Show available commands' },
];

interface ChatInputProps {
  onSubmit: (text: string) => void;
  onSlashCommand: (command: string) => void;
  isActive: boolean;
  history: string[];
}

export default function ChatInput({
  onSubmit,
  onSlashCommand,
  isActive,
  history,
}: ChatInputProps): React.ReactElement {
  const [inputKey, setInputKey] = useState(0);
  const historyIndexRef = useRef(-1);

  useInput(
    (_input, key) => {
      if (!isActive) return;

      if (key.upArrow && history.length > 0) {
        const newIndex = Math.min(historyIndexRef.current + 1, history.length - 1);
        historyIndexRef.current = newIndex;
      }
      if (key.downArrow) {
        if (historyIndexRef.current <= 0) {
          historyIndexRef.current = -1;
        } else {
          historyIndexRef.current -= 1;
        }
      }
    },
    { isActive },
  );

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('/')) {
        const cmd = trimmed.split(' ')[0].toLowerCase();
        onSlashCommand(cmd);
      } else {
        onSubmit(trimmed);
      }
      historyIndexRef.current = -1;
      setInputKey((k) => k + 1);
    },
    [onSubmit, onSlashCommand],
  );

  const defaultValue = historyIndexRef.current >= 0 && historyIndexRef.current < history.length
    ? history[historyIndexRef.current]
    : undefined;

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="round"
        borderColor={isActive ? COLORS.accent : COLORS.border}
        paddingX={1}
      >
        <Box gap={1} width="100%">
          <Text color={COLORS.accent}>{'>'}</Text>
          {isActive ? (
            <TextInput
              key={inputKey}
              placeholder="send a message or type /help for commands..."
              defaultValue={defaultValue}
              onSubmit={handleSubmit}
            />
          ) : (
            <Text dimColor>waiting...</Text>
          )}
        </Box>
      </Box>
      <Box gap={1} paddingX={1}>
        <Text dimColor>ctrl+c to exit</Text>
        <Text dimColor>|</Text>
        <Text dimColor>enter to send</Text>
        <Text dimColor>|</Text>
        <Text dimColor>/help for commands</Text>
      </Box>
    </Box>
  );
}

export { SLASH_COMMANDS };
