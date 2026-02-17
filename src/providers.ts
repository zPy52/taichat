import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createDeepInfra } from '@ai-sdk/deepinfra';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { getApiKey, type AppConfig } from '@/config';

export interface ModelInfo {
  id: string;
  label: string;
  provider: string;
  providerLabel: string;
}

export const MODEL_LIST: ModelInfo[] = [
  // OpenAI
  { id: 'openai:gpt-4.1', label: 'GPT-4.1', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'openai:gpt-4.1-mini', label: 'GPT-4.1 Mini', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'openai:gpt-4.1-nano', label: 'GPT-4.1 Nano', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'openai:gpt-4o', label: 'GPT-4o', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'openai:gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'openai:o3-mini', label: 'o3-mini', provider: 'openai', providerLabel: 'OpenAI' },
  // Anthropic
  { id: 'anthropic:claude-sonnet-4-20250514', label: 'Claude Sonnet 4', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'anthropic:claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'anthropic', providerLabel: 'Anthropic' },
  // DeepSeek
  { id: 'deepseek:deepseek-chat', label: 'DeepSeek Chat (V3)', provider: 'deepseek', providerLabel: 'DeepSeek' },
  { id: 'deepseek:deepseek-reasoner', label: 'DeepSeek Reasoner (R1)', provider: 'deepseek', providerLabel: 'DeepSeek' },
  // DeepInfra
  { id: 'deepinfra:meta-llama/Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B', provider: 'deepinfra', providerLabel: 'DeepInfra' },
  { id: 'deepinfra:mistralai/Mistral-Small-24B-Instruct-2501', label: 'Mistral Small 24B', provider: 'deepinfra', providerLabel: 'DeepInfra' },
  { id: 'deepinfra:Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B', provider: 'deepinfra', providerLabel: 'DeepInfra' },
  // Kimi (Moonshot)
  { id: 'kimi:moonshot-v1-8k', label: 'Moonshot V1 8K', provider: 'kimi', providerLabel: 'Kimi (Moonshot)' },
  { id: 'kimi:moonshot-v1-32k', label: 'Moonshot V1 32K', provider: 'kimi', providerLabel: 'Kimi (Moonshot)' },
];

export function getAvailableModels(config: AppConfig): ModelInfo[] {
  return MODEL_LIST.filter((m) => {
    const key = getApiKey(m.provider, config);
    return !!key;
  });
}

export function resolveModel(modelId: string, config: AppConfig): LanguageModelV2 {
  const [providerName, ...modelParts] = modelId.split(':');
  const modelName = modelParts.join(':');
  const apiKey = getApiKey(providerName, config);

  if (!apiKey) {
    throw new Error(`No API key configured for provider "${providerName}". Run taichat and use /config to set it up.`);
  }

  switch (providerName) {
    case 'openai': {
      const provider = createOpenAI({ apiKey });
      return provider(modelName) as unknown as LanguageModelV2;
    }
    case 'anthropic': {
      const provider = createAnthropic({ apiKey });
      return provider(modelName) as unknown as LanguageModelV2;
    }
    case 'deepseek': {
      const provider = createDeepSeek({ apiKey });
      return provider(modelName) as unknown as LanguageModelV2;
    }
    case 'deepinfra': {
      const provider = createDeepInfra({ apiKey });
      return provider(modelName) as unknown as LanguageModelV2;
    }
    case 'kimi': {
      const provider = createOpenAICompatible({
        name: 'kimi',
        baseURL: 'https://api.moonshot.cn/v1',
        apiKey,
      });
      return provider.chatModel(modelName) as unknown as LanguageModelV2;
    }
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

export function getModelLabel(modelId: string): string {
  const info = MODEL_LIST.find((m) => m.id === modelId);
  return info ? `${info.label} (${info.providerLabel})` : modelId;
}

export function getProviderFromModelId(modelId: string): string {
  return modelId.split(':')[0];
}
