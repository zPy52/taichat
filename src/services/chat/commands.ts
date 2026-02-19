import type { ChatSlashCommandAction } from '@/services/chat/types';

export class SubmoduleChatServiceCommands {
  public parse(command: string): ChatSlashCommandAction {
    switch (command) {
      case '/model':
        return { type: 'show-overlay', overlay: 'model-selector' };
      case '/clear':
        return { type: 'clear-conversation' };
      case '/config':
        return { type: 'show-overlay', overlay: 'config-setup' };
      case '/help':
        return { type: 'show-overlay', overlay: 'help' };
      case '/copy':
        return { type: 'copy-last-assistant-message' };
      case '/exit':
      case '/quit':
        return { type: 'exit' };
      default:
        return { type: 'unknown', command };
    }
  }
}
