import { Const } from '@/const';
import type { AppConfig, ProviderName } from '@/controllers/config/types';

export class SubmoduleConfigControllerApiKeys {
  public get(provider: ProviderName, config: AppConfig): string | undefined {
    const envVar = Const.config.ENV_KEY_MAP[provider];
    if (process.env[envVar]) {
      return process.env[envVar];
    }
    return config.apiKeys[provider];
  }

  public hasAny(config: AppConfig): boolean {
    for (const provider of Object.keys(Const.config.ENV_KEY_MAP) as ProviderName[]) {
      if (this.get(provider, config)) {
        return true;
      }
    }
    return false;
  }
}
