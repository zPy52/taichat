import os from 'node:os';
import path from 'node:path';
import type { AppConfig, ProviderName } from '@/controllers/config';

export const CONFIG_DIR = path.join(os.homedir(), '.taichat');
export const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export const DEFAULT_CONFIG: AppConfig = {
  defaultModel: 'openai:gpt-5.2',
  apiKeys: {},
};

export const ENV_KEY_MAP: Record<ProviderName, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  exa: 'EXA_API_KEY',
};
