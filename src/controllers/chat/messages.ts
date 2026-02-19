import type { ChatMessageData } from '@/components/chat-message';
import { generateId, type UIMessage } from 'ai';

type ReasoningPart = Extract<UIMessage['parts'][number], { type: 'reasoning' }>;
type DynamicToolPart = Extract<UIMessage['parts'][number], { type: 'dynamic-tool' }>;
type SetMessagesFn = (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;

export class SubmoduleChatControllerMessages {
  private messages: UIMessage[] = [];
  private setMessages: SetMessagesFn | null = null;

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

        const toolName = part.toolName;
        const toolArgs =
          part.input && typeof part.input === 'object'
            ? (part.input as Record<string, unknown>)
            : {};
        displayMessages.push({
          id: `${message.id}-tool-call-${part.toolCallId}`,
          role: 'tool-call',
          content: '',
          toolName,
          toolArgs,
        });

        if (part.state === 'output-available') {
          const content =
            typeof part.output === 'string' ? part.output : JSON.stringify(part.output, null, 2);
          displayMessages.push({
            id: `${message.id}-tool-result-${part.toolCallId}`,
            role: 'tool-result',
            content,
            toolName,
          });
        } else if (part.state === 'output-error') {
          displayMessages.push({
            id: `${message.id}-tool-result-${part.toolCallId}`,
            role: 'tool-result',
            content: `Error: ${part.errorText}`,
            toolName,
          });
        } else if (part.state === 'output-denied') {
          displayMessages.push({
            id: `${message.id}-tool-result-${part.toolCallId}`,
            role: 'tool-result',
            content: 'Tool call denied.',
            toolName,
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

  private isToolLikePart(part: UIMessage['parts'][number]): part is DynamicToolPart {
    return part.type === 'dynamic-tool';
  }

  private isReasoningPart(part: UIMessage['parts'][number]): part is ReasoningPart {
    return part.type === 'reasoning';
  }
}
