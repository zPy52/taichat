import fs from 'node:fs';
import { Const } from '@/const';
import { GetRxController, Obs } from 'getrx';
import type { ModelInfo } from '@/services/providers/types';
import { FALLBACK_MODEL_LIST } from '@/services/providers/models';
import { ModelsDevService } from '@/services/providers/models-dev';

export class ModelsController extends GetRxController {
  public models = new Obs<ModelInfo[]>(ModelsController.loadCache());

  public onInit = async (): Promise<void> => {
    void this.sync();
  };

  public static loadCache(): ModelInfo[] {
    try {
      if (fs.existsSync(Const.config.MODELS_CACHE_FILE)) {
        const raw = fs.readFileSync(Const.config.MODELS_CACHE_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as ModelInfo[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fall through to fallback list.
    }

    return [...FALLBACK_MODEL_LIST];
  }

  public static saveCache(models: ModelInfo[]): void {
    if (!fs.existsSync(Const.config.CONFIG_DIR)) {
      fs.mkdirSync(Const.config.CONFIG_DIR, { recursive: true });
    }

    fs.writeFileSync(Const.config.MODELS_CACHE_FILE, JSON.stringify(models, null, 2), 'utf-8');
  }

  public async sync(): Promise<void> {
    try {
      const models = await ModelsDevService.fetchModels();
      const hasChanges = JSON.stringify(this.models.value) !== JSON.stringify(models);
      if (!hasChanges) {
        return;
      }

      this.models.value = models;
      ModelsController.saveCache(models);
    } catch {
      // Ignore network/cache refresh errors and keep cached/fallback models.
    }
  }
}
