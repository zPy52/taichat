export interface PendingToolCall {
  approvalId: string;
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}
