import type { ToolApprovalStatus } from '@/services/agent';
import type { PendingToolCall } from '@/services/agent';
import type { ChatMessageData } from '@/components/chat-message';
import type { ModelMessage } from 'ai';
import type { ReviewDecision } from '@/components/tool-call-review';

export type OverlayMode = 'none' | 'model-selector' | 'help' | 'config-setup';

export type ApprovalResolver = ((decision: ToolApprovalStatus) => void) | null;

export interface ChatStateSnapshot {
  inputHistory: string[];
  coreMessages: ModelMessage[];
  displayMessages: ChatMessageData[];
  loading: boolean;
  streamingText: string;
  overlay: OverlayMode;
  streamingReasoning: string;
  reasoningVisible: boolean;
  pendingToolCall: PendingToolCall | null;
}

export type ChatEvent =
  | { type: 'chat/input-submitted'; text: string }
  | { type: 'chat/stream-text-delta'; delta: string }
  | { type: 'chat/reasoning-started' }
  | { type: 'chat/reasoning-delta'; delta: string }
  | { type: 'chat/reasoning-ended' }
  | { type: 'chat/stream-flush-requested' }
  | { type: 'chat/stream-flushed'; content: string }
  | { type: 'chat/assistant-text'; content: string }
  | { type: 'chat/tool-call'; toolCall: PendingToolCall }
  | { type: 'chat/tool-result'; toolName: string; result: unknown }
  | { type: 'chat/tool-approval-requested'; toolCall: PendingToolCall; resolve: (decision: ToolApprovalStatus) => void }
  | { type: 'chat/tool-approval-decided'; decision: ReviewDecision }
  | { type: 'chat/agent-finished' }
  | { type: 'chat/agent-error'; error: Error }
  | { type: 'chat/overlay-set'; overlay: OverlayMode }
  | { type: 'chat/overlay-dismissed' }
  | { type: 'chat/cleared' };
