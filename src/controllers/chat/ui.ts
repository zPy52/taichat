import type { SubmoduleChatControllerEvents } from '@/controllers/chat/events';
import type { SubmoduleChatControllerState } from '@/controllers/chat/state';

export class SubmoduleChatControllerUi {
  public constructor(
    private readonly state: SubmoduleChatControllerState,
    private readonly events: SubmoduleChatControllerEvents,
  ) {
    this.events.subscribe('chat/stream-text-delta', ({ delta }) => {
      this.state.streamingText.value = this.state.streamingText.value + delta;
    });

    this.events.subscribe('chat/reasoning-started', () => {
      this.state.reasoningVisible.value = true;
      this.state.streamingReasoning.value = '';
    });

    this.events.subscribe('chat/reasoning-delta', ({ delta }) => {
      if (this.state.reasoningVisible.value) {
        this.state.streamingReasoning.value = this.state.streamingReasoning.value + delta;
      }
    });

    this.events.subscribe('chat/reasoning-ended', () => {
      this.state.reasoningVisible.value = false;
      this.state.streamingReasoning.value = '';
    });

    this.events.subscribe('chat/stream-flush-requested', () => {
      const content = this.state.streamingText.value;
      if (!content) {
        return;
      }

      this.events.publish({
        type: 'chat/stream-flushed',
        content,
      });
      this.state.streamingText.value = '';
    });

    this.events.subscribe('chat/overlay-set', ({ overlay }) => {
      this.state.overlay.value = overlay;
    });

    this.events.subscribe('chat/overlay-dismissed', () => {
      this.state.overlay.value = 'none';
    });

    this.events.subscribe('chat/agent-finished', () => {
      this.state.loading.value = false;
    });

    this.events.subscribe('chat/agent-error', () => {
      this.state.loading.value = false;
    });
  }
}
