import type { ToolApprovalStatus } from '@/services/chat-server';

export type OverlayMode = 'none' | 'model-selector' | 'help' | 'config-setup';

export type ApprovalResolver = ((decision: ToolApprovalStatus) => void) | null;
