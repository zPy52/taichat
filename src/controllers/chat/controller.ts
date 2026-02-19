import { Get, GetRxController } from 'getrx';
import { SubmoduleChatControllerUi } from '@/controllers/chat/ui';
import { ConfigController, type AppConfig } from '@/controllers/config';
import { SubmoduleChatControllerMessages } from '@/controllers/chat/messages';
import { SubmoduleChatControllerToolApproval } from '@/controllers/chat/tool-approval';
import { SubmoduleChatControllerEvents } from '@/controllers/chat/events';
import { SubmoduleChatControllerState } from '@/controllers/chat/state';
import { ChatService } from '@/services/chat';
import type { ReviewDecision } from '@/components/tool-call-review';
import type { OverlayMode } from '@/controllers/chat/types';
import type { Obs } from 'getrx';
import type { ChatMessageData } from '@/components/chat-message';
import type { ModelMessage } from 'ai';
import type { PendingToolCall } from '@/services/agent';

export class ChatController extends GetRxController {
  private readonly state = new SubmoduleChatControllerState();
  private readonly events = new SubmoduleChatControllerEvents();

  private readonly ui = new SubmoduleChatControllerUi(this.state, this.events);
  private readonly messages = new SubmoduleChatControllerMessages(this.state, this.events);
  private readonly toolApproval = new SubmoduleChatControllerToolApproval(this.state, this.events);

  private exitFn: (() => void) | null = null;

  public constructor() {
    super();
    // Keep submodules referenced so they stay active for event subscriptions.
    void this.ui;
    void this.messages;
    void this.toolApproval;
  }

  public setExitFn(exitFn: () => void): void {
    this.exitFn = exitFn;
  }

  public get displayMessages(): Obs<ChatMessageData[]> {
    return this.state.displayMessages;
  }

  public get inputHistory(): Obs<string[]> {
    return this.state.inputHistory;
  }

  public get loading(): Obs<boolean> {
    return this.state.loading;
  }

  public get streamingText(): Obs<string> {
    return this.state.streamingText;
  }

  public get streamingReasoning(): Obs<string> {
    return this.state.streamingReasoning;
  }

  public get reasoningVisible(): Obs<boolean> {
    return this.state.reasoningVisible;
  }

  public get pendingToolCall(): Obs<PendingToolCall | null> {
    return this.state.pendingToolCall;
  }

  public get overlay(): Obs<OverlayMode> {
    return this.state.overlay;
  }

  public get coreMessages(): Obs<ModelMessage[]> {
    return this.state.coreMessages;
  }

  public get isInputActive(): boolean {
    return !this.state.loading.value && !this.state.pendingToolCall.value && this.state.overlay.value === 'none';
  }

  public async sendMessage(text: string): Promise<void> {
    await this.messages.sendMessage(text);
  }

  public applyToolDecision(decision: ReviewDecision): void {
    this.toolApproval.apply(decision);
  }

  public dismissOverlay(): void {
    this.events.publish({ type: 'chat/overlay-dismissed' });
  }

  public showOverlay(overlay: Exclude<OverlayMode, 'none'>): void {
    this.events.publish({ type: 'chat/overlay-set', overlay });
  }

  public switchModel(newModelId: string): void {
    Get.find(ConfigController)!.setModel(newModelId);
    this.events.publish({ type: 'chat/assistant-text', content: `Switched to model: ${newModelId}` });
    this.events.publish({ type: 'chat/overlay-dismissed' });
  }

  public saveConfig(newConfig: AppConfig): void {
    Get.find(ConfigController)!.saveConfig(newConfig);
    this.events.publish({ type: 'chat/overlay-dismissed' });
    this.events.publish({ type: 'chat/assistant-text', content: 'Configuration saved.' });
  }

  public processSlashCommand(command: string): void {
    const action = ChatService.commands.parse(command);

    switch (action.type) {
      case 'show-overlay':
        this.showOverlay(action.overlay);
        return;
      case 'clear-conversation':
        this.state.clearConversation();
        this.events.publish({ type: 'chat/cleared' });
        return;
      case 'copy-last-assistant-message': {
        const lastAssistantMessage = [...this.state.displayMessages.value!]
          .reverse()
          .find((message) => message.role === 'assistant');

        if (!lastAssistantMessage) {
          this.events.publish({ type: 'chat/assistant-text', content: 'No assistant message to copy.' });
          return;
        }

        if (!ChatService.clipboard.copy(lastAssistantMessage.content)) {
          this.events.publish({ type: 'chat/assistant-text', content: 'Failed to copy message to clipboard.' });
          return;
        }

        this.events.publish({ type: 'chat/assistant-text', content: 'Copied the last assistant message to clipboard.' });
        return;
      }
      case 'exit':
        this.exitFn?.();
        return;
      case 'unknown':
        this.events.publish({
          type: 'chat/assistant-text',
          content: `Unknown command: ${action.command}. Type /help for available commands.`,
        });
        return;
    }
  }

  public onClose(): void {
    this.events.clear();
  }
}
