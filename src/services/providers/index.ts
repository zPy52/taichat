import { createProviderRegistry, defaultSettingsMiddleware, wrapLanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { MODEL_LIST, PROVIDER_LIST } from '@/services/providers/models';
import type { LanguageModelV2, ProviderV3 } from '@ai-sdk/provider';
import type { ModelInfo, ProviderInfo, ProviderModelId } from '@/services/providers/types';
import { ConfigController, type AppConfig, type ChatProviderName } from '@/controllers/config';

export type { ModelInfo, ProviderInfo } from '@/services/providers/types';
export { MODEL_LIST, PROVIDER_LIST } from '@/services/providers/models';

export class AiProviderService {
  private static sortModels(models: ModelInfo[]): ModelInfo[] {
    return [...models].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  static listAll(): ModelInfo[] {
    return AiProviderService.sortModels(MODEL_LIST);
  }

  static listAvailable(config: AppConfig): ModelInfo[] {
    return AiProviderService.sortModels(
      MODEL_LIST.filter((model) => !!ConfigController.apiKeys.get(model.provider, config)),
    );
  }

  static listProviders(): ProviderInfo[] {
    return PROVIDER_LIST;
  }

  static listAvailableProviders(config: AppConfig): ProviderInfo[] {
    return PROVIDER_LIST.filter((provider) => !!ConfigController.apiKeys.get(provider.id, config));
  }

  static listByProvider(provider: ChatProviderName, config: AppConfig): ModelInfo[] {
    return AiProviderService.sortModels(
      MODEL_LIST.filter(
        (model) => model.provider === provider && !!ConfigController.apiKeys.get(model.provider, config),
      ),
    );
  }

  static label(modelId: string): string {
    const info = MODEL_LIST.find((model) => model.id === modelId);
    return info ? `${info.label} (${info.providerLabel})` : modelId;
  }

  static getModel(modelId: string, config: AppConfig): LanguageModelV2 {
    const model = MODEL_LIST.find((entry) => entry.id === modelId);
    if (!model) {
      throw new Error(`Unknown model "${modelId}".`);
    }

    const apiKey = ConfigController.apiKeys.get(model.provider, config);
    if (!apiKey) {
      throw new Error(
        `No API key configured for provider "${model.provider}". Run taichat and use /config to set it up.`,
      );
    }

    const providers: Partial<Record<ChatProviderName, ProviderV3>> = {};

    const openaiKey = ConfigController.apiKeys.get('openai', config);
    if (openaiKey) {
      providers.openai = createOpenAI({ apiKey: openaiKey }) as unknown as ProviderV3;
    }

    const anthropicKey = ConfigController.apiKeys.get('anthropic', config);
    if (anthropicKey) {
      providers.anthropic = createAnthropic({ apiKey: anthropicKey }) as unknown as ProviderV3;
    }

    const registry = createProviderRegistry(providers, { separator: ':' });
    const registryModelId = (model.baseModelId ?? model.id) as ProviderModelId;
    const baseModel = registry.languageModel(registryModelId);

    if (model.providerOptions || model.maxOutputTokens) {
      const wrappedModel = wrapLanguageModel({
        model: baseModel,
        middleware: defaultSettingsMiddleware({
          settings: {
            ...(model.maxOutputTokens ? { maxOutputTokens: model.maxOutputTokens } : {}),
            ...(model.providerOptions ? { providerOptions: model.providerOptions } : {}),
          },
        }),
      });

      return wrappedModel as unknown as LanguageModelV2;
    }

    return baseModel as unknown as LanguageModelV2;
  }
}
