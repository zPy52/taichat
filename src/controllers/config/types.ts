export type ToolProviderName = 'exa';
export type ChatProviderName = 'openai' | 'anthropic';
export type ProviderName = ChatProviderName | ToolProviderName;

export interface AppConfig {
  defaultModel: string;
  apiKeys: Partial<Record<ProviderName, string>>;
}
