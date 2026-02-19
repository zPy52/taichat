import { Get, GetRxController } from 'getrx';
import { spawnSync } from 'node:child_process';
import { SubmoduleChatControllerUi } from '@/controllers/chat/ui';
import { ConfigController, type AppConfig } from '@/controllers/config';
import { SubmoduleChatControllerMessages } from '@/controllers/chat/messages';
import { SubmoduleChatControllerToolApproval } from '@/controllers/chat/tool-approval';

export class ChatController extends GetRxController {
  public readonly ui = new SubmoduleChatControllerUi();
  public readonly messages = new SubmoduleChatControllerMessages();
  public readonly toolApproval = new SubmoduleChatControllerToolApproval();

  private exitFn: (() => void) | null = null;

  public setExitFn(exitFn: () => void): void {
    this.exitFn = exitFn;
  }

  public get isInputActive(): boolean {
    return !this.toolApproval.pendingToolCall.value && this.ui.overlay.value === 'none';
  }

  public switchModel(newModelId: string): void {
    Get.find(ConfigController)!.setModel(newModelId);
    this.messages.addAssistant(`Switched to model: ${newModelId}`);
    this.ui.dismissOverlay();
  }

  public saveConfig(newConfig: AppConfig): void {
    Get.find(ConfigController)!.saveConfig(newConfig);
    this.messages.addAssistant('Configuration saved.');
    this.ui.dismissOverlay();
  }

  public processSlashCommand(command: string): void {
    switch (command) {
      case '/model':
        this.ui.overlay.value = 'model-selector';
        break;
      case '/clear':
        this.messages.clear();
        break;
      case '/config':
        this.ui.overlay.value = 'config-setup';
        break;
      case '/help':
        this.ui.overlay.value = 'help';
        break;
      case '/copy': {
        const lastAssistantMessage = [...this.messages.getDisplayMessages()]
          .reverse()
          .find((message) => message.role === 'assistant');

        if (!lastAssistantMessage) {
          this.messages.addAssistant('No assistant message to copy.');
          break;
        }

        const copyCommand =
          process.platform === 'darwin'
            ? { command: 'pbcopy', args: [] as string[] }
            : process.platform === 'win32'
              ? { command: 'clip', args: [] as string[] }
              : { command: 'xclip', args: ['-selection', 'clipboard'] };

        const result = spawnSync(copyCommand.command, copyCommand.args, {
          input: lastAssistantMessage.content,
          encoding: 'utf8',
        });

        if (result.error || result.status !== 0) {
          this.messages.addAssistant('Failed to copy message to clipboard.');
          break;
        }

        this.messages.addAssistant('Copied the last assistant message to clipboard.');
        break;
      }
      case '/exit':
      case '/quit':
        this.exitFn?.();
        break;
      default:
        this.messages.addAssistant(`Unknown command: ${command}. Type /help for available commands.`);
    }
  }
}
