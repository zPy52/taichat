import type { PendingToolCall } from '@/services/agent';

export type ReviewDecision = 'approved' | 'denied';

export interface ToolCallReviewProps {
  toolCall: PendingToolCall;
  onDecision: (decision: ReviewDecision) => void;
}

export interface ToolCallArgsProps {
  toolCall: PendingToolCall;
}
