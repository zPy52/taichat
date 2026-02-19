export type ToolApprovalStatus = 'approved' | 'denied';

export interface PendingToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface AgentCallbacks {
  onTextDelta: (delta: string) => void;
  onReasoningStart: () => void;
  onReasoningDelta: (delta: string) => void;
  onReasoningEnd: () => void;
  onToolCall: (toolCall: PendingToolCall) => void;
  onToolResult: (toolCallId: string, toolName: string, result: unknown) => void;
  onFinish: () => void;
  onError: (error: Error) => void;
  requestToolApproval: (toolCall: PendingToolCall) => Promise<ToolApprovalStatus>;
}
