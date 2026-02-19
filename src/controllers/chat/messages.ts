import { Tools } from '@/tools';
import { Obs, Get } from 'getrx';
import { AgentService } from '@/services/agent';
import { ConfigController } from '@/controllers/config';
import { ChatController } from '@/controllers/chat/controller';
import type { ChatMessageData } from '@/components/chat-message';
import { convertToModelMessages, generateId, type UIMessage } from 'ai';

type DynamicToolPart = Extract<UIMessage['parts'][number], { type: 'dynamic-tool' }>;

export class SubmoduleChatControllerMessages {
  private messages = new Obs<UIMessage[]>([]);

  private add(message: UIMessage | Omit<UIMessage, 'id'>): void {
    this.messages.value = [
      ...this.messages.value!,
      'id' in message ? message : { ...message, id: generateId() },
    ];
  }

  public use(): ChatMessageData[] {
    const messages = this.messages.use() ?? [];
    return this.toDisplayMessages(messages);
  }

  public clear(): void {
    this.messages.value = [];
  }

  public getDisplayMessages(): ChatMessageData[] {
    return this.toDisplayMessages(this.messages.value ?? []);
  }

  public addAssistant(content: string): void {
    this.add({
      role: 'assistant',
      parts: [{ type: 'text', text: content }],
    });
  }

  public async submit({ content }: { content: string }): Promise<void> {
    const chat = Get.find(ChatController)!;
    if (chat.ui.loading.value) {
      return;
    }

    this.add({
      role: 'user',
      parts: [{ type: 'text', text: content }],
    });

    const configController = Get.find(ConfigController)!;
    const config = configController.config.value!;
    const modelId = configController.modelId.value!;

    const exaApiKey = ConfigController.apiKeys.get('exa', config);
    if (exaApiKey) {
      process.env.EXA_API_KEY = exaApiKey;
    }

    const abortController = new AbortController();

    try {
      const modelMessages = await convertToModelMessages(
        this.messages.value!.map(({ id: _id, ...message }) => message),
        {
          tools: Tools.allTools(),
          ignoreIncompleteToolCalls: true,
        },
      );

      this.prepareStreamingState();

      await AgentService.run(
        modelMessages,
        modelId,
        config,
        {
          onTextDelta: (delta) => {
            chat.ui.streamingText.value = chat.ui.streamingText.value + delta;
          },
          onReasoningStart: () => {
            chat.ui.reasoningVisible.value = true;
            chat.ui.streamingReasoning.value = '';
          },
          onReasoningDelta: (delta) => {
            if (chat.ui.reasoningVisible.value) {
              chat.ui.streamingReasoning.value = chat.ui.streamingReasoning.value + delta;
            }
          },
          onReasoningEnd: () => {
            this.resetReasoningState();
          },
          onToolCall: (toolCall) => {
            chat.ui.flush();
            this.resetReasoningState();
            this.add({
              role: 'assistant',
              parts: [
                {
                  type: 'dynamic-tool',
                  toolCallId: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  state: 'input-available',
                  input: toolCall.args,
                },
              ],
            });
          },
          onToolResult: (toolCallId, toolName, result) => {
            this.setToolCallResult(toolCallId, toolName, result);
            chat.toolApproval.pendingToolCall.value = null;
          },
          onFinish: () => {
            this.finishStreaming();
          },
          onError: (error) => {
            this.finishStreaming();
            this.addAssistant(`Error: ${error.message}`);
          },
          requestToolApproval: (toolCall) => chat.toolApproval.request(toolCall),
        },
        abortController.signal,
      );
    } catch (error) {
      if (!abortController.signal.aborted) {
        this.finishStreaming();
        this.addAssistant(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
      Get.find(ChatController)!.ui.loading.value = false;
    }
  }

  private prepareStreamingState(): void {
    const chat = Get.find(ChatController)!;
    chat.ui.streamingText.value = '';
    chat.ui.loading.value = true;
    this.resetReasoningState();
  }

  private resetReasoningState(): void {
    const chat = Get.find(ChatController)!;
    chat.ui.streamingReasoning.value = '';
    chat.ui.reasoningVisible.value = false;
  }

  private finishStreaming(): void {
    const chat = Get.find(ChatController)!;
    chat.ui.flush();
    this.resetReasoningState();
    chat.ui.loading.value = false;
  }

  private setToolCallResult(toolCallId: string, toolName: string, result: unknown): void {
    const messages = [...this.messages.value!];
    const messageIndex = messages.findIndex(
      (message) =>
        message.role === 'assistant' &&
        message.parts.some(
          (part) =>
            part.type === 'dynamic-tool' &&
            part.toolCallId === toolCallId &&
            (part.state === 'input-available' || part.state === 'approval-responded'),
        ),
    );

    if (messageIndex === -1) {
      this.add({
        role: 'assistant',
        parts: [
          {
            type: 'dynamic-tool',
            toolCallId,
            toolName,
            state: 'output-available',
            input: {},
            output: result,
          },
        ],
      });
      return;
    }

    const nextParts = messages[messageIndex]!.parts.map((part) => {
      if (!this.isToolLikePart(part)) {
        return part;
      }

      if (
        part.type !== 'dynamic-tool' ||
        part.toolCallId !== toolCallId ||
        (part.state !== 'input-available' && part.state !== 'approval-responded')
      ) {
        return part;
      }

      return {
        type: 'dynamic-tool' as const,
        toolName: part.toolName,
        toolCallId: part.toolCallId,
        state: 'output-available' as const,
        input: part.input,
        output: result,
      };
    });

    messages[messageIndex] = {
      ...messages[messageIndex]!,
      parts: nextParts,
    };

    this.messages.value = messages;
  }

  private toDisplayMessages(messages: UIMessage[]): ChatMessageData[] {
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

  private isToolLikePart(part: UIMessage['parts'][number]): part is DynamicToolPart {
    return part.type === 'dynamic-tool';
  }
}
