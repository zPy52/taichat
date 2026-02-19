import { Box, Text } from 'ink';
import { useGet } from 'getrx';
import React from 'react';
import ConfigSetup from '@/components/config-setup';
import TerminalChat from '@/components/terminal-chat';
import { ConfigController } from '@/controllers/config';

interface AppProps {
  version: string;
}

export default function App({ version }: AppProps): React.ReactElement {
  const configController = useGet(ConfigController);
  const config = configController.config.use()!;
  const needsSetup = configController.needsSetup.use();

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
            configController.saveConfig(newConfig);
          }}
        />
      </Box>
    );
  }

  return <TerminalChat config={config} version={version} />;
}
