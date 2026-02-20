import type {
  ModelInfo,
  ModelsDevApiResponse,
  ModelsDevProvider,
  ProviderModelId,
} from '@/services/providers/types';

const MODELS_DEV_API_URL = 'https://models.dev/api.json';

const OPENAI_REASONING_VARIANTS: ReadonlyArray<{
  suffix: string;
  labelSuffix: string;
  reasoningEffort: 'low' | 'medium' | 'high' | 'xhigh';
  maxOutputTokens?: number;
}> = [
  { suffix: 'minimal', labelSuffix: 'Minimal', reasoningEffort: 'low', maxOutputTokens: 4000 },
  { suffix: 'low', labelSuffix: 'Low', reasoningEffort: 'low' },
  { suffix: 'medium', labelSuffix: 'Medium', reasoningEffort: 'medium' },
  { suffix: 'high', labelSuffix: 'High', reasoningEffort: 'high' },
  {
    suffix: 'extra-high',
    labelSuffix: 'Extra High',
    reasoningEffort: 'xhigh',
    maxOutputTokens: 100000,
  },
];

const ANTHROPIC_THINKING_VARIANTS: ReadonlyArray<{
  suffix: string;
  labelSuffix: string;
  budgetTokens: number;
}> = [
  { suffix: 'thinking-low', labelSuffix: 'Thinking Low', budgetTokens: 8000 },
  { suffix: 'thinking-medium', labelSuffix: 'Thinking Medium', budgetTokens: 16000 },
  { suffix: 'thinking-high', labelSuffix: 'Thinking High', budgetTokens: 32000 },
];

export class ModelsDevService {
  static async fetchModels(): Promise<ModelInfo[]> {
    const response = await fetch(MODELS_DEV_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as ModelsDevApiResponse;
    const models = ModelsDevService.toModelList(payload);

    if (models.length === 0) {
      throw new Error('No models were returned from models.dev for supported providers.');
    }

    return models;
  }

  static toModelList(data: ModelsDevApiResponse): ModelInfo[] {
    const models: ModelInfo[] = [];
    let sortOrder = 1;

    sortOrder = ModelsDevService.appendProviderModels(
      models,
      data.openai,
      'openai',
      'OpenAI',
      sortOrder,
    );
    ModelsDevService.appendProviderModels(
      models,
      data.anthropic,
      'anthropic',
      'Anthropic',
      sortOrder,
    );

    return models;
  }

  private static appendProviderModels(
    output: ModelInfo[],
    provider: ModelsDevProvider | undefined,
    providerId: 'openai' | 'anthropic',
    providerLabel: string,
    startSortOrder: number,
  ): number {
    if (!provider || typeof provider.models !== 'object' || !provider.models) {
      return startSortOrder;
    }

    const sortedModels = Object.values(provider.models).sort((a, b) => a.name.localeCompare(b.name));
    let sortOrder = startSortOrder;

    for (const model of sortedModels) {
      const baseModel: ModelInfo = {
        id: `${providerId}:${model.id}`,
        label: model.name,
        provider: providerId,
        providerLabel,
        sortOrder,
      };
      output.push(baseModel);
      sortOrder += 1;

      if (!model.reasoning) {
        continue;
      }

      const variants =
        providerId === 'openai'
          ? ModelsDevService.toOpenAiVariants(baseModel, sortOrder)
          : ModelsDevService.toAnthropicVariants(baseModel, sortOrder);

      output.push(...variants);
      sortOrder += variants.length;
    }

    return sortOrder;
  }

  private static toOpenAiVariants(base: ModelInfo, startSortOrder: number): ModelInfo[] {
    return OPENAI_REASONING_VARIANTS.map((variant, index) => ({
      id: `${base.id}:${variant.suffix}`,
      baseModelId: base.id as ProviderModelId,
      label: `${base.label} ${variant.labelSuffix}`,
      provider: 'openai' as const,
      providerLabel: base.providerLabel,
      sortOrder: startSortOrder + index,
      providerOptions: { openai: { reasoningEffort: variant.reasoningEffort } },
      ...(variant.maxOutputTokens !== undefined
        ? { maxOutputTokens: variant.maxOutputTokens }
        : {}),
    }));
  }

  private static toAnthropicVariants(base: ModelInfo, startSortOrder: number): ModelInfo[] {
    return ANTHROPIC_THINKING_VARIANTS.map((variant, index) => ({
      id: `${base.id}:${variant.suffix}`,
      baseModelId: base.id as ProviderModelId,
      label: `${base.label} ${variant.labelSuffix}`,
      provider: 'anthropic' as const,
      providerLabel: base.providerLabel,
      sortOrder: startSortOrder + index,
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled' as const, budgetTokens: variant.budgetTokens },
        },
      },
    }));
  }
}
