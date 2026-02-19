import { useInput } from 'ink';
import { useCallback, useRef, useState } from 'react';
import type { UseInputHistoryOptions, UseInputHistoryResult } from '@/components/chat-input/types';

export function useInputHistory({
  history,
  isActive,
  onSubmit,
  onSlashCommand,
}: UseInputHistoryOptions): UseInputHistoryResult {
  const [inputKey, setInputKey] = useState(0);
  const historyIndexRef = useRef(-1);

  useInput(
    (_input, key) => {
      if (!isActive) {
        return;
      }

      if (key.upArrow && history.length > 0) {
        const nextHistoryIndex = Math.min(historyIndexRef.current + 1, history.length - 1);
        historyIndexRef.current = nextHistoryIndex;
      }

      if (key.downArrow) {
        if (historyIndexRef.current <= 0) {
          historyIndexRef.current = -1;
          return;
        }

        historyIndexRef.current -= 1;
      }
    },
    { isActive },
  );

  const handleSubmit = useCallback(
    (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      if (trimmedText.startsWith('/')) {
        const command = trimmedText.split(' ')[0].toLowerCase();
        onSlashCommand(command);
      } else {
        onSubmit(trimmedText);
      }

      historyIndexRef.current = -1;
      setInputKey((value) => value + 1);
    },
    [onSubmit, onSlashCommand],
  );

  const defaultValue =
    historyIndexRef.current >= 0 && historyIndexRef.current < history.length
      ? history[historyIndexRef.current]
      : undefined;

  return {
    inputKey,
    defaultValue,
    handleSubmit,
  };
}
