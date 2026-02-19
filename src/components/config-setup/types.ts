import type { AppConfig, ProviderName } from '@/controllers/config';

export interface ConfigSetupProps {
  config: AppConfig;
  onComplete: (config: AppConfig) => void;
}

export type SetupStep = 'provider-select' | 'key-input';

export interface SetupProviderOption {
  id: ProviderName;
  label: string;
}
