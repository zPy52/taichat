import { Obs } from 'getrx';
import type { OverlayMode } from '@/controllers/chat/types';

export class SubmoduleChatControllerUi {
  public overlay = new Obs<OverlayMode>('none');

  public dismissOverlay(): void {
    this.overlay.value = 'none';
  }
}
