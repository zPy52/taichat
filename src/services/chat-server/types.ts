export type ToolApprovalStatus = 'approved' | 'denied';

export interface PendingToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}
