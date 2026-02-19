import { Get, Obs } from 'getrx';
import { ChatController } from '@/controllers/chat/controller';
import type { OverlayMode } from '@/controllers/chat/types';

export class SubmoduleChatControllerUi {
  public loading = new Obs<boolean>(false);
  public streamingText = new Obs<string>('');
  public overlay = new Obs<OverlayMode>('none');
  public streamingReasoning = new Obs<string>('');
  public reasoningVisible = new Obs<boolean>(false);

  public dismissOverlay(): void {
    this.overlay.value = 'none';
  }

  public flush(): void {
    const content = this.streamingText.value;
    if (!content) {
      return;
    }
    Get.find(ChatController)!.messages.addAssistant(content);
    this.streamingText.value = '';
  }
}
