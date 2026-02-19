import type { PendingToolCall } from '@/services/chat-server';

export type ReviewDecision = 'approved' | 'denied';

export interface ToolCallReviewProps {
  toolCall: PendingToolCall;
  onDecision: (decision: ReviewDecision) => void;
}

export interface ToolCallArgsProps {
  toolCall: PendingToolCall;
}
