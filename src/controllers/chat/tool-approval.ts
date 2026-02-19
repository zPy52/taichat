import type { ApprovalResolver } from '@/controllers/chat/types';
import type { ReviewDecision } from '@/components/tool-call-review';
import type { SubmoduleChatControllerState } from '@/controllers/chat/state';
import type { SubmoduleChatControllerEvents } from '@/controllers/chat/events';

export class SubmoduleChatControllerToolApproval {
  private approvalResolver: ApprovalResolver = null;

  public constructor(
    private readonly state: SubmoduleChatControllerState,
    private readonly events: SubmoduleChatControllerEvents,
  ) {
    this.events.subscribe('chat/tool-approval-requested', ({ toolCall, resolve }) => {
      this.state.pendingToolCall.value = toolCall;
      this.approvalResolver = resolve;
    });

    this.events.subscribe('chat/tool-result', () => {
      this.state.pendingToolCall.value = null;
    });
  }

  public apply(decision: ReviewDecision): void {
    if (this.approvalResolver) {
      this.approvalResolver(decision);
      this.approvalResolver = null;
    }
    this.state.pendingToolCall.value = null;
    this.events.publish({ type: 'chat/tool-approval-decided', decision });
  }
}
