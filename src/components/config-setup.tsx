import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { TextInput, Select } from '@inkjs/ui';
import { COLORS } from '@/utils/colors';
import { PROVIDER_NAMES, TOOL_PROVIDER_NAMES, type AppConfig } from '@/config';

interface ConfigSetupProps {
  config: AppConfig;
  onComplete: (config: AppConfig) => void;
}

type SetupStep = 'provider-select' | 'key-input' | 'done';

const ALL_KEYS = { ...PROVIDER_NAMES, ...TOOL_PROVIDER_NAMES };

export default function ConfigSetup({ config, onComplete }: ConfigSetupProps): React.ReactElement {
  const [step, setStep] = useState<SetupStep>('provider-select');
  const [currentProvider, setCurrentProvider] = useState<string | null>(null);
  const [updatedConfig, setUpdatedConfig] = useState<AppConfig>({ ...config, apiKeys: { ...config.apiKeys } });
  const [configuredKeys, setConfiguredKeys] = useState<string[]>([]);

  const providerOptions = Object.entries(ALL_KEYS)
    .map(([key, label]) => ({
      label: `${label}${updatedConfig.apiKeys[key as keyof typeof updatedConfig.apiKeys] ? ' ✓' : ''}`,
      value: key,
    }));
  providerOptions.push({ label: 'Done - save and continue', value: '__done__' });

  if (step === 'provider-select') {
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={COLORS.accent} paddingX={1} marginY={1}>
        <Box marginBottom={1}>
          <Text bold color={COLORS.accent}>API Key Setup</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Select a provider to configure (or &quot;Done&quot; to finish):</Text>
        </Box>
        <Select
          options={providerOptions}
          onChange={(value) => {
            if (value === '__done__') {
              onComplete(updatedConfig);
            } else {
              setCurrentProvider(value);
              setStep('key-input');
            }
          }}
        />
        {configuredKeys.length > 0 && (
          <Box marginTop={1}>
            <Text color={COLORS.success}>
              Configured: {configuredKeys.map((k) => ALL_KEYS[k]).join(', ')}
            </Text>
          </Box>
        )}
      </Box>
    );
  }

  if (step === 'key-input' && currentProvider) {
    const providerLabel = ALL_KEYS[currentProvider] || currentProvider;
    return (
      <Box flexDirection="column" borderStyle="round" borderColor={COLORS.accent} paddingX={1} marginY={1}>
        <Box marginBottom={1} gap={1}>
          <Text bold color={COLORS.accent}>Enter API key for</Text>
          <Text bold color={COLORS.success}>{providerLabel}</Text>
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Paste your key and press Enter (leave empty to skip):</Text>
        </Box>
        <Box gap={1}>
          <Text color={COLORS.accent}>{'>'}</Text>
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
