import React, { useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { Select } from '@inkjs/ui';
import { COLORS } from '@/utils/colors';
import { AiProviderService } from '@/services/providers';
import type { ModelSelectorProps } from '@/components/model-selector/types';
import type { ChatProviderName } from '@/controllers/config';

export default function ModelSelector({
  config,
  currentModelId,
  onSelect,
  onCancel,
}: ModelSelectorProps): React.ReactElement {
  const [step, setStep] = useState<'provider' | 'model'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<ChatProviderName | null>(null);

  const providerOptions = useMemo(() => {
    const availableProviders = AiProviderService.listAvailableProviders(config);
    const providers =
      availableProviders.length > 0 ? availableProviders : AiProviderService.listProviders();

    return [
      ...providers.map((provider) => ({ label: provider.label, value: provider.id })),
      { label: 'Cancel', value: '__cancel__' },
    ];
  }, [config]);

  const modelOptions = useMemo(() => {
    if (!selectedProvider) {
      return [];
    }

    const availableModels = AiProviderService.listByProvider(selectedProvider, config);
    const allModels = AiProviderService.listAll().filter((model) => model.provider === selectedProvider);
    const models = availableModels.length > 0 ? availableModels : allModels;

    return [
      ...models.map((model) => ({
        label: `${model.label} ${model.id === currentModelId ? '(current)' : ''}`,
        value: model.id,
      })),
      { label: 'Back', value: '__back__' },
      { label: 'Cancel', value: '__cancel__' },
    ];
  }, [config, currentModelId, selectedProvider]);

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
        {step === 'model' && selectedProvider && (
          <>
            <Text dimColor>Provider:</Text>
            <Text color={COLORS.success}>{selectedProvider}</Text>
          </>
        )}
        <Text dimColor>Current:</Text>
        <Text color={COLORS.success}>{currentModelId}</Text>
      </Box>

      <Select
        options={step === 'provider' ? providerOptions : modelOptions}
        onChange={(value) => {
          if (value === '__cancel__') {
            onCancel();
            return;
          }

          if (value === '__back__') {
            setStep('provider');
            setSelectedProvider(null);
            return;
          }

          if (step === 'provider') {
            setSelectedProvider(value as ChatProviderName);
            setStep('model');
            return;
          }

          onSelect(value);
        }}
      />
    </Box>
  );
}
