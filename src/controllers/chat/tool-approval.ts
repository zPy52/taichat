import { Obs } from 'getrx';
import type { UIMessage } from 'ai';
import type { PendingToolCall } from '@/services/chat-server';

type ToolLikePart = Extract<UIMessage['parts'][number], { type: 'dynamic-tool' | `tool-${string}` }>;

export class SubmoduleChatControllerToolApproval {
  public pendingToolCall = new Obs<PendingToolCall | null>(null);

  public sync(messages: UIMessage[]): void {
    this.pendingToolCall.value = this.getPendingToolCall(messages);
  }

  private getPendingToolCall(messages: UIMessage[]): PendingToolCall | null {
    const latestAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant');
    if (!latestAssistantMessage) {
      return null;
    }

    const pendingPart = latestAssistantMessage.parts.find((part) => this.isApprovalRequestedToolPart(part));
    if (!pendingPart) {
      return null;
    }

    return {
      approvalId: pendingPart.approval.id,
      toolCallId: pendingPart.toolCallId,
      toolName: this.getToolName(pendingPart),
      args: this.getToolArgs(pendingPart),
    };
  }

  private isApprovalRequestedToolPart(part: UIMessage['parts'][number]): part is ToolLikePart & {
    state: 'approval-requested';
    toolCallId: string;
    approval: { id: string };
  } {
    if (!this.isToolLikePart(part)) {
      return false;
    }
    if (!('state' in part) || part.state !== 'approval-requested') {
      return false;
    }
    if (!('toolCallId' in part) || typeof part.toolCallId !== 'string') {
      return false;
    }
    if (
      !('approval' in part) ||
      !part.approval ||
      typeof part.approval !== 'object' ||
      !('id' in part.approval) ||
      typeof part.approval.id !== 'string'
    ) {
      return false;
    }
    return true;
  }

  private isToolLikePart(part: UIMessage['parts'][number]): part is ToolLikePart {
    if (part.type === 'dynamic-tool') {
      return true;
    }
    return typeof part.type === 'string' && part.type.startsWith('tool-');
  }

  private getToolName(part: ToolLikePart): string {
    if ('toolName' in part && typeof part.toolName === 'string' && part.toolName.length > 0) {
      return part.toolName;
    }
    if (part.type.startsWith('tool-')) {
      return part.type.slice('tool-'.length);
    }
    return 'tool';
  }

  private getToolArgs(part: ToolLikePart): Record<string, unknown> {
    if ('input' in part && part.input && typeof part.input === 'object') {
      return part.input as Record<string, unknown>;
    }
    return {};
  }
}
