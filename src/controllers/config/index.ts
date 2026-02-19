import fs from 'node:fs';
import { GetRxController, Obs } from 'getrx';
import { Const } from '@/const';
import type { AppConfig } from '@/controllers/config/types';
import { SubmoduleConfigControllerApiKeys } from '@/controllers/config/api-keys';

export type { AppConfig, ProviderName, ChatProviderName } from '@/controllers/config/types';

export class ConfigController extends GetRxController {
  public static readonly apiKeys = new SubmoduleConfigControllerApiKeys();

  public config = new Obs<AppConfig>(ConfigController.load());
  public modelId = new Obs<string>(this.config.value!.defaultModel!);
  public needsSetup = new Obs<boolean>(!ConfigController.apiKeys.hasAny(this.config.value!));

  public static load(): AppConfig {
    try {
      if (fs.existsSync(Const.config.CONFIG_FILE)) {
        const raw = fs.readFileSync(Const.config.CONFIG_FILE, 'utf-8');
        const saved = JSON.parse(raw) as Partial<AppConfig>;
        return {
          ...Const.config.DEFAULT_CONFIG,
          ...saved,
        };
      }
    } catch {
      // Fall through to default
    }
    return { ...Const.config.DEFAULT_CONFIG };
  }

  public static save(config: AppConfig): void {
    if (!fs.existsSync(Const.config.CONFIG_DIR)) {
      fs.mkdirSync(Const.config.CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(Const.config.CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  }

  public setModel(modelId: string): void {
    const updatedConfig: AppConfig = {
      ...this.config.value!,
      defaultModel: modelId,
    };
    this.config.value = updatedConfig;
    this.modelId.value = modelId;
    this.needsSetup.value = !ConfigController.apiKeys.hasAny(updatedConfig);
    ConfigController.save(updatedConfig);
  }

  public saveConfig(newConfig: AppConfig): void {
    this.config.value = newConfig;
    this.modelId.value = newConfig.defaultModel;
    this.needsSetup.value = !ConfigController.apiKeys.hasAny(newConfig);
    ConfigController.save(newConfig);
  }
}
