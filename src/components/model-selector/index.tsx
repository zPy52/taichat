import { Box, Text } from 'ink';
import { Const } from '@/const';
import { Select } from '@inkjs/ui';
import React, { useMemo, useState } from 'react';
import { AiProviderService } from '@/services/providers';
import type { ChatProviderName } from '@/controllers/config';
import type { ModelSelectorProps } from '@/components/model-selector/types';

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
      borderColor={Const.colors.accent}
      paddingX={1}
      marginY={1}
    >
      <Box marginBottom={1} gap={1}>
        <Text bold color={Const.colors.accent}>Switch model</Text>
        {step === 'model' && selectedProvider && (
          <>
            <Text dimColor>Provider:</Text>
            <Text color={Const.colors.success}>{selectedProvider}</Text>
          </>
        )}
        <Text dimColor>Current:</Text>
        <Text color={Const.colors.success}>{currentModelId}</Text>
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
