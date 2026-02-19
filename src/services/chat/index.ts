import { SubmoduleChatServiceClipboard } from '@/services/chat/clipboard';
import { SubmoduleChatServiceCommands } from '@/services/chat/commands';

export type { ChatSlashCommandAction } from '@/services/chat/types';

export class ChatService {
  public static readonly commands = new SubmoduleChatServiceCommands();
  public static readonly clipboard = new SubmoduleChatServiceClipboard();
}
