import type { AppConfig } from '@/controllers/config';

export interface TerminalChatProps {
  config: AppConfig;
  version: string;
  port: number;
  token: string;
}
