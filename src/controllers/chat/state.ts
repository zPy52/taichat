import { Obs } from 'getrx';
import { generateId, type ModelMessage } from 'ai';
import type { ChatMessageData } from '@/components/chat-message';
import type { OverlayMode } from '@/controllers/chat/types';
import type { PendingToolCall } from '@/services/agent';

export class SubmoduleChatControllerState {
  public readonly inputHistory = new Obs<string[]>([]);
  public readonly coreMessages = new Obs<ModelMessage[]>([]);
  public readonly displayMessages = new Obs<ChatMessageData[]>([]);

  public readonly loading = new Obs<boolean>(false);
  public readonly streamingText = new Obs<string>('');
  public readonly overlay = new Obs<OverlayMode>('none');
  public readonly streamingReasoning = new Obs<string>('');
  public readonly reasoningVisible = new Obs<boolean>(false);
  public readonly pendingToolCall = new Obs<PendingToolCall | null>(null);

  public addDisplayMessage(message: ChatMessageData): void {
    this.displayMessages.value = [...this.displayMessages.value!, message];
  }

  public addAssistantText(content: string): void {
    this.addDisplayMessage({
      id: generateId(),
      role: 'assistant',
      content,
    });
  }

  public addUserText(content: string): void {
    this.addDisplayMessage({
      id: generateId(),
      role: 'user',
      content,
    });
  }

  public addToolCallMessage(toolName: string, toolArgs: Record<string, unknown>): void {
    this.addDisplayMessage({
      id: generateId(),
      role: 'tool-call',
      content: '',
      toolName,
      toolArgs,
    });
  }

  public addToolResultMessage(toolName: string, result: unknown): void {
    const content = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    this.addDisplayMessage({
      id: generateId(),
      role: 'tool-result',
      content,
      toolName,
    });
  }

  public pushInputHistory(input: string): void {
    this.inputHistory.value = [input, ...this.inputHistory.value!];
  }

  public appendCoreUserMessage(content: string): ModelMessage[] {
    const nextMessages: ModelMessage[] = [
      ...this.coreMessages.value!,
      { role: 'user', content },
    ];
    this.coreMessages.value = nextMessages;
    return nextMessages;
  }

  public setCoreMessages(messages: ModelMessage[]): void {
    this.coreMessages.value = messages;
  }

  public resetStreamState(): void {
    this.streamingText.value = '';
    this.streamingReasoning.value = '';
    this.reasoningVisible.value = false;
  }

  public clearConversation(): void {
    this.resetStreamState();
    this.displayMessages.value = [];
    this.coreMessages.value = [];
  }
}
