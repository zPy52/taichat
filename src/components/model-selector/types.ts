import type { AppConfig } from '@/controllers/config';

export interface ModelSelectorProps {
  config: AppConfig;
  currentModelId: string;
  onSelect: (modelId: string) => void;
  onCancel: () => void;
}
