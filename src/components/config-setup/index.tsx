import { Box, Text } from 'ink';
import { Const } from '@/const';
import React, { useState } from 'react';
import { TextInput, Select } from '@inkjs/ui';
import type { AppConfig, ProviderName } from '@/controllers/config';
import type { ConfigSetupProps, SetupProviderOption, SetupStep } from '@/components/config-setup/types';

const SETUP_PROVIDERS: SetupProviderOption[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'exa', label: 'Exa AI (Web Search)' },
];

export default function ConfigSetup({ config, onComplete }: ConfigSetupProps): React.ReactElement {
  const [step, setStep] = useState<SetupStep>('provider-select');
  const [currentProvider, setCurrentProvider] = useState<ProviderName | null>(null);
  const [updatedConfig, setUpdatedConfig] = useState<AppConfig>({ ...config, apiKeys: { ...config.apiKeys } });
  const [configuredKeys, setConfiguredKeys] = useState<ProviderName[]>([]);

  const providerOptions: Array<{ label: string; value: string }> = SETUP_PROVIDERS.map(({ id, label }) => ({
    label: `${label}${updatedConfig.apiKeys[id] ? ' ✓' : ''}`,
    value: id,
  }));
  providerOptions.push({ label: 'Done - save and continue', value: '__done__' });

  if (step === 'provider-select') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={Const.colors.accent} paddingX={1} marginY={1}>
        <Box marginBottom={1}>
          <Text bold color={Const.colors.accent}>API Key Setup</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Select a provider to configure (or &quot;Done&quot; to finish):</Text>
        </Box>
        <Select
          options={providerOptions}
          onChange={(value) => {
            if (value === '__done__') {
              onComplete(updatedConfig);
              return;
            }

            setCurrentProvider(value as ProviderName);
            setStep('key-input');
          }}
        />
        {configuredKeys.length > 0 && (
          <Box marginTop={1}>
            <Text color={Const.colors.success}>
              Configured: {configuredKeys.map((provider) => SETUP_PROVIDERS.find((entry) => entry.id === provider)?.label || provider).join(', ')}
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  if (step === 'key-input' && currentProvider) {
    const providerLabel = SETUP_PROVIDERS.find((provider) => provider.id === currentProvider)?.label || currentProvider;

    return (
      <Box flexDirection="column" borderStyle="round" borderColor={Const.colors.accent} paddingX={1} marginY={1}>
        <Box marginBottom={1} gap={1}>
          <Text bold color={Const.colors.accent}>Enter API key for</Text>
          <Text bold color={Const.colors.success}>{providerLabel}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Paste your key and press Enter (leave empty to skip):</Text>
        </Box>
        <Box gap={1}>
          <Text color={Const.colors.accent}>{'>'}</Text>
          <TextInput
            placeholder="sk-..."
            onSubmit={(value) => {
              if (value.trim()) {
                const newConfig = {
                  ...updatedConfig,
                  apiKeys: {
                    ...updatedConfig.apiKeys,
                    [currentProvider]: value.trim(),
                  },
                };
                setUpdatedConfig(newConfig);
                setConfiguredKeys([...configuredKeys, currentProvider]);
              }
              setCurrentProvider(null);
              setStep('provider-select');
            }}
          />
        </Box>
      </Box>
    );
  }

  return <Text>Setting up...</Text>;
}
