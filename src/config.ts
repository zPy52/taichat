import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface AppConfig {
  defaultModel: string;
  apiKeys: {
    openai?: string;
    anthropic?: string;
    deepseek?: string;
    deepinfra?: string;
    kimi?: string;
    exa?: string;
  };
}

const CONFIG_DIR = path.join(os.homedir(), '.taichat');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: AppConfig = {
  defaultModel: 'openai:gpt-4.1-nano',
  apiKeys: {},
};

const ENV_KEY_MAP: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  deepinfra: 'DEEPINFRA_API_KEY',
  kimi: 'KIMI_API_KEY',
  exa: 'EXA_API_KEY',
};

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const saved = JSON.parse(raw) as Partial<AppConfig>;
      return {
        ...DEFAULT_CONFIG,
        ...saved,
        apiKeys: { ...DEFAULT_CONFIG.apiKeys, ...saved.apiKeys },
      };
    }
  } catch {
    // Fall through to default
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: AppConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function configExists(): boolean {
  return fs.existsSync(CONFIG_FILE);
}

export function getApiKey(provider: string, config: AppConfig): string | undefined {
  const envVar = ENV_KEY_MAP[provider];
  if (envVar && process.env[envVar]) {
    return process.env[envVar];
  }
  return config.apiKeys[provider as keyof typeof config.apiKeys];
}

export function hasAnyApiKey(config: AppConfig): boolean {
  for (const provider of Object.keys(ENV_KEY_MAP)) {
    if (getApiKey(provider, config)) {
      return true;
    }
  }
  return false;
}

export const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  deepseek: 'DeepSeek',
  deepinfra: 'DeepInfra',
  kimi: 'Kimi (Moonshot)',
};

export const TOOL_PROVIDER_NAMES: Record<string, string> = {
  exa: 'Exa AI (Web Search)',
};
