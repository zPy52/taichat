import { Obs } from 'getrx';
import type { ApprovalResolver } from '@/controllers/chat/types';
import type { ReviewDecision } from '@/components/tool-call-review';
import type { PendingToolCall, ToolApprovalStatus } from '@/services/chat-server';

export class SubmoduleChatControllerToolApproval {
  public pendingToolCall = new Obs<PendingToolCall | null>(null);
  private approvalResolver: ApprovalResolver = null;

  public apply(decision: ReviewDecision): void {
    if (this.approvalResolver) {
      this.approvalResolver(decision);
      this.approvalResolver = null;
    }
    this.pendingToolCall.value = null;
  }

  public request(toolCall: PendingToolCall): Promise<ToolApprovalStatus> {
    this.pendingToolCall.value = toolCall;
    return new Promise((resolve) => {
      this.approvalResolver = resolve;
    });
  }
}
