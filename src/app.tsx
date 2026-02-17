import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TerminalChat from '@/components/terminal-chat';
import ConfigSetup from '@/components/config-setup';
import { loadConfig, saveConfig, hasAnyApiKey, type AppConfig } from '@/config';

interface AppProps {
  version: string;
}

export default function App({ version }: AppProps): React.ReactElement {
  const [config, setConfig] = useState<AppConfig>(loadConfig);
  const [needsSetup, setNeedsSetup] = useState(!hasAnyApiKey(config));

  if (needsSetup) {
    return (
      <Box flexDirection="column">
        <Box
          flexDirection="column"
          borderStyle="bold"
          borderColor="#22d3ee"
          paddingX={1}
          marginBottom={1}
        >
          <Box gap={1}>
            <Text bold color="#22d3ee">
              {'>'}_
            </Text>
            <Text bold color="#22d3ee">
              TaiChat
            </Text>
            <Text dimColor>(v{version})</Text>
          </Box>
          <Text dimColor>
            Welcome! Let&apos;s set up your API keys to get started.
          </Text>
        </Box>
        <ConfigSetup
          config={config}
          onComplete={(newConfig) => {
            saveConfig(newConfig);
            setConfig(newConfig);
            setNeedsSetup(false);
          }}
        />
      </Box>
    );
  }

  return <TerminalChat config={config} version={version} />;
}
