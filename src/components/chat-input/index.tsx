import React from 'react';
import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';
import { Const } from '@/const';
import { useInputHistory } from '@/components/chat-input/hooks';
import type { ChatInputProps } from '@/components/chat-input/types';

export default function ChatInput({
  onSubmit,
  onSlashCommand,
  isActive,
  history,
}: ChatInputProps): React.ReactElement {
  const { inputKey, defaultValue, handleSubmit } = useInputHistory({
    history,
    isActive,
    onSubmit,
    onSlashCommand,
  });

  return (
    <Box flexDirection="column">
      <Box
        borderStyle="round"
        borderColor={isActive ? Const.colors.accent : Const.colors.border}
        paddingX={1}
      >
        <Box gap={1} width="100%">
          <Text color={Const.colors.accent}>{'>'}</Text>
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
