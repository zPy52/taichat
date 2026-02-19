import { Get } from 'getrx';
import { AgentService } from '@/services/agent';
import { ConfigController } from '@/controllers/config';
import type { SubmoduleChatControllerState } from '@/controllers/chat/state';
import type { SubmoduleChatControllerEvents } from '@/controllers/chat/events';
import type { ToolApprovalStatus } from '@/services/agent';

export class SubmoduleChatControllerMessages {
  public constructor(
    private readonly state: SubmoduleChatControllerState,
    private readonly events: SubmoduleChatControllerEvents,
  ) {
    this.events.subscribe('chat/stream-flushed', ({ content }) => {
      this.state.addAssistantText(content);
    });

    this.events.subscribe('chat/assistant-text', ({ content }) => {
      this.state.addAssistantText(content);
    });

    this.events.subscribe('chat/tool-call', ({ toolCall }) => {
      this.state.addToolCallMessage(toolCall.toolName, toolCall.args);
    });

    this.events.subscribe('chat/tool-result', ({ toolName, result }) => {
      this.state.addToolResultMessage(toolName, result);
    });

    this.events.subscribe('chat/agent-error', ({ error }) => {
      this.state.addAssistantText(`Error: ${error.message}`);
    });
  }

  public async sendMessage(text: string): Promise<void> {
    if (this.state.loading.value) return;

    this.events.publish({ type: 'chat/input-submitted', text });
    this.state.addUserText(text);
    this.state.pushInputHistory(text);
    const newCoreMessages = this.state.appendCoreUserMessage(text);
    this.state.loading.value = true;
    this.state.resetStreamState();

    const configController = Get.find(ConfigController)!;
    const config = configController.config.value!;
    const modelId = configController.modelId.value!;

    const exaApiKey = ConfigController.apiKeys.get('exa', config);
    if (exaApiKey) {
      process.env.EXA_API_KEY = exaApiKey;
    }

    const abortController = new AbortController();

    try {
      const updatedMessages = await AgentService.run(
        newCoreMessages,
        modelId,
        config,
        {
          onTextDelta: (delta) => {
            this.events.publish({ type: 'chat/stream-text-delta', delta });
          },
          onReasoningStart: () => {
            this.events.publish({ type: 'chat/reasoning-started' });
          },
          onReasoningDelta: (delta) => {
            this.events.publish({ type: 'chat/reasoning-delta', delta });
          },
          onReasoningEnd: () => {
            this.events.publish({ type: 'chat/reasoning-ended' });
          },
          onToolCall: (toolCall) => {
            this.events.publish({ type: 'chat/stream-flush-requested' });
            this.events.publish({ type: 'chat/reasoning-ended' });
            this.events.publish({ type: 'chat/tool-call', toolCall });
          },
          onToolResult: (_toolCallId, toolName, result) => {
            this.events.publish({ type: 'chat/tool-result', toolName, result });
          },
          onFinish: () => {
            this.events.publish({ type: 'chat/stream-flush-requested' });
            this.events.publish({ type: 'chat/reasoning-ended' });
            this.events.publish({ type: 'chat/agent-finished' });
          },
          onError: (error) => {
            this.events.publish({ type: 'chat/stream-flush-requested' });
            this.events.publish({ type: 'chat/reasoning-ended' });
            this.events.publish({ type: 'chat/agent-error', error });
          },
          requestToolApproval: (toolCall) => this.requestToolApproval(toolCall),
        },
        abortController.signal,
      );

      this.state.setCoreMessages(updatedMessages);
    } catch (error) {
      if (!abortController.signal.aborted) {
        this.events.publish({ type: 'chat/stream-flush-requested' });
        this.events.publish({ type: 'chat/reasoning-ended' });
        this.events.publish({
          type: 'chat/agent-error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
      this.state.loading.value = false;
    }
  }

  private requestToolApproval(toolCall: { toolCallId: string; toolName: string; args: Record<string, unknown> }): Promise<ToolApprovalStatus> {
    return new Promise((resolve) => {
      this.events.publish({
        type: 'chat/tool-approval-requested',
        toolCall,
        resolve,
      });
    });
  }
}
