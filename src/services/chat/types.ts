import type { OverlayMode } from '@/controllers/chat/types';

export type ChatSlashCommandAction =
  | { type: 'show-overlay'; overlay: Exclude<OverlayMode, 'none'> }
  | { type: 'clear-conversation' }
  | { type: 'copy-last-assistant-message' }
  | { type: 'exit' }
  | { type: 'unknown'; command: string };
