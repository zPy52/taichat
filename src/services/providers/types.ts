import type { ChatProviderName } from '@/controllers/config';

export interface ModelInfo {
  id: string;
  baseModelId?: ProviderModelId;
  label: string;
  provider: ChatProviderName;
  providerLabel: string;
  sortOrder: number;
  providerOptions?: {
    openai?: { reasoningEffort: 'low' | 'medium' | 'high' | 'xhigh' };
    anthropic?: { thinking: { type: 'enabled'; budgetTokens: number } };
  };
  maxOutputTokens?: number;
}

export interface ProviderInfo {
  id: ChatProviderName;
  label: string;
}

export type ProviderModelId = `openai:${string}` | `anthropic:${string}`;

// --- models.dev API response (https://models.dev/api.json) ---
export interface ModelsDevModelLimit {
  output?: number;
}

export interface ModelsDevModel {
  id: string;
  name: string;
  reasoning?: boolean;
  limit?: ModelsDevModelLimit;
}

export interface ModelsDevProvider {
  id: string;
  name: string;
  models: Record<string, ModelsDevModel>;
}

export type ModelsDevApiResponse = Record<string, ModelsDevProvider>;
