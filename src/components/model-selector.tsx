import React from 'react';
import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { COLORS } from '@/utils/colors';
import { getAvailableModels, MODEL_LIST, type ModelInfo } from '@/providers';
import type { AppConfig } from '@/config';

interface ModelSelectorProps {
  config: AppConfig;
  currentModelId: string;
  onSelect: (modelId: string) => void;
  onCancel: () => void;
}

export default function ModelSelector({
  config,
  currentModelId,
  onSelect,
  onCancel,
}: ModelSelectorProps): React.ReactElement {
  const availableModels = getAvailableModels(config);
  const allModels = availableModels.length > 0 ? availableModels : MODEL_LIST;

  const options = allModels.map((m: ModelInfo) => ({
    label: `${m.label} ${m.id === currentModelId ? '(current)' : ''}`,
    value: m.id,
  }));

  options.push({ label: 'Cancel', value: '__cancel__' });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={COLORS.accent}
      paddingX={1}
      marginY={1}
    >
      <Box marginBottom={1} gap={1}>
        <Text bold color={COLORS.accent}>Switch model</Text>
        <Text dimColor>Current:</Text>
        <Text color={COLORS.success}>{currentModelId}</Text>
      </Box>

      <Select
        options={options}
        onChange={(value) => {
          if (value === '__cancel__') {
            onCancel();
          } else {
            onSelect(value);
          }
        }}
      />
    </Box>
  );
}
