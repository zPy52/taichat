import type { ToolApprovalStatus } from '@/services/agent';

export type OverlayMode = 'none' | 'model-selector' | 'help' | 'config-setup';

export type ApprovalResolver = ((decision: ToolApprovalStatus) => void) | null;
