import type { ChatProviderName } from '@/controllers/config';

export interface ModelInfo {
  id: string;
  baseModelId?: ProviderModelId;
  label: string;
  provider: ChatProviderName;
  providerLabel: string;
  sortOrder: number;
  providerOptions?: {
    openai?: { reasoningEffort: 'low' | 'medium' | 'high' };
    anthropic?: { thinking: { type: 'enabled'; budgetTokens: number } };
  };
  maxOutputTokens?: number;
}

export interface ProviderInfo {
  id: ChatProviderName;
  label: string;
}

export type ProviderModelId = `openai:${string}` | `anthropic:${string}`;
