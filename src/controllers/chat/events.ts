import type { ChatEvent } from '@/controllers/chat/types';

type ChatEventHandler<TEvent extends ChatEvent = ChatEvent> = (event: TEvent) => void;

export class SubmoduleChatControllerEvents {
  private readonly listeners = new Map<ChatEvent['type'], Set<ChatEventHandler>>();

  public publish(event: ChatEvent): void {
    const handlers = this.listeners.get(event.type);
    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      handler(event);
    }
  }

  public subscribe<TType extends ChatEvent['type']>(
    type: TType,
    handler: (event: Extract<ChatEvent, { type: TType }>) => void,
  ): () => void {
    const handlers = this.listeners.get(type) ?? new Set<ChatEventHandler>();
    handlers.add(handler as ChatEventHandler);
    this.listeners.set(type, handlers);

    return () => {
      const currentHandlers = this.listeners.get(type);
      if (!currentHandlers) {
        return;
      }

      currentHandlers.delete(handler as ChatEventHandler);
      if (currentHandlers.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  public clear(): void {
    this.listeners.clear();
  }
}
