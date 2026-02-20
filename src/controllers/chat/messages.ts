import type { ChatMessageData } from '@/components/chat-message';
import { generateId, type UIMessage } from 'ai';

type ReasoningPart = Extract<UIMessage['parts'][number], { type: 'reasoning' }>;
type SetMessagesFn = (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
type ToolLikePart = Extract<UIMessage['parts'][number], { type: 'dynamic-tool' | `tool-${string}` }>;

export class SubmoduleChatControllerMessages {
  private messages: UIMessage[] = [];
  private setMessages: SetMessagesFn | null = null;

  private isToolPartDone(part: ToolLikePart): boolean {
    const state = this.getToolState(part);
    return (
      state === 'output-available' || state === 'output-error' || state === 'output-denied'
    );
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

  private getToolState(part: ToolLikePart): string | undefined {
    if ('state' in part && typeof part.state === 'string') {
      return part.state;
    }
    return undefined;
  }

  public clear(): void {
    this.messages = [];
    if (this.setMessages) {
      this.setMessages([]);
    }
  }

  public bindSetMessages(setMessages: SetMessagesFn): void {
    this.setMessages = setMessages;
  }

  public sync(messages: UIMessage[]): void {
    this.messages = messages;
  }

  public getDisplayMessages(): ChatMessageData[] {
    return this.toDisplayMessages(this.messages);
  }

  public addAssistant(content: string): void {
    const assistantMessage: UIMessage = {
      id: generateId(),
      role: 'assistant',
      parts: [{ type: 'text', text: content }],
    };

    this.messages = [...this.messages, assistantMessage];
    if (this.setMessages) {
      this.setMessages((messages) => [...messages, assistantMessage]);
    }
  }

  public toDisplayMessages(messages: UIMessage[]): ChatMessageData[] {
    const displayMessages: ChatMessageData[] = [];

    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === 'text') {
          const role =
            message.role === 'user' ? 'user' : message.role === 'assistant' ? 'assistant' : null;
          if (!role || !part.text) {
            continue;
          }
          displayMessages.push({
            id: `${message.id}-text-${displayMessages.length}`,
            role,
            content: part.text,
          });
          continue;
        }

        if (!this.isToolLikePart(part)) {
          continue;
        }

        const toolName = this.getToolName(part);
        const toolCallId =
          'toolCallId' in part && typeof part.toolCallId === 'string'
            ? part.toolCallId
            : `${message.id}-tool-${displayMessages.length}`;
        const toolArgs =
          'input' in part && part.input && typeof part.input === 'object'
            ? (part.input as Record<string, unknown>)
            : {};
        const toolState = this.getToolState(part);
        if (!this.isToolPartDone(part)) {
          displayMessages.push({
            id: `${message.id}-tool-call-${toolCallId}`,
            role: 'tool-call',
            content: '',
            toolName,
            toolArgs,
          });
        }

        if (toolState === 'output-available') {
          const content =
            'output' in part && typeof part.output === 'string'
              ? part.output
              : JSON.stringify(('output' in part ? part.output : null) ?? null, null, 2);
          displayMessages.push({
            id: `${message.id}-tool-result-${toolCallId}`,
            role: 'tool-result',
            content,
            toolName,
            toolArgs,
          });
        } else if (toolState === 'output-error') {
          const errorText =
            'errorText' in part && typeof part.errorText === 'string'
              ? part.errorText
              : 'Unknown tool error.';
          displayMessages.push({
            id: `${message.id}-tool-result-${toolCallId}`,
            role: 'tool-result',
            content: `Error: ${errorText}`,
            toolName,
            toolArgs,
          });
        } else if (toolState === 'output-denied') {
          displayMessages.push({
            id: `${message.id}-tool-result-${toolCallId}`,
            role: 'tool-result',
            content: 'Tool call denied.',
            toolName,
            toolArgs,
          });
        }
      }
    }

    return displayMessages;
  }

  public getStreamingReasoning(messages: UIMessage[]): string {
    const latestAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant');
    if (!latestAssistantMessage) {
      return '';
    }

    return latestAssistantMessage.parts
      .filter((part): part is ReasoningPart => this.isReasoningPart(part))
      .map((part) => part.text)
      .join('');
  }

  private isToolLikePart(part: UIMessage['parts'][number]): part is ToolLikePart {
    if (part.type === 'dynamic-tool') {
      return true;
    }
    return typeof part.type === 'string' && part.type.startsWith('tool-');
  }

  private isReasoningPart(part: UIMessage['parts'][number]): part is ReasoningPart {
    return part.type === 'reasoning';
  }
}
