import React from 'react';
import { useGet } from 'getrx';
import { Box, Text } from 'ink';
import { Const } from '@/const';
import ConfigSetup from '@/components/config-setup';
import TerminalChat from '@/components/terminal-chat';
import { ConfigController } from '@/controllers/config';
import { ModelsController } from '@/controllers/models';

interface AppProps {
  version: string;
  port: number;
  token: string;
}

export default function App({ version, port, token }: AppProps): React.ReactElement {
  useGet(ModelsController);
  const configController = useGet(ConfigController);
  const config = configController.config.use()!;
  const needsSetup = configController.needsSetup.use();

  if (needsSetup) {
    return (
      <Box flexDirection="column">
        <Box
          flexDirection="column"
          borderStyle="bold"
          borderColor={Const.colors.accent}
          paddingX={1}
          marginBottom={1}
        >
          <Box gap={1}>
            <Text bold color={Const.colors.accent}>
              {'>'}_
            </Text>
            <Text bold color={Const.colors.accent}>
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

  return <TerminalChat config={config} version={version} port={port} token={token} />;
}
