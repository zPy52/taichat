import { spawnSync } from 'node:child_process';

export class SubmoduleChatServiceClipboard {
  public copy(content: string): boolean {
    const copyCommand =
      process.platform === 'darwin'
        ? { command: 'pbcopy', args: [] as string[] }
        : process.platform === 'win32'
          ? { command: 'clip', args: [] as string[] }
          : { command: 'xclip', args: ['-selection', 'clipboard'] };

    const result = spawnSync(copyCommand.command, copyCommand.args, {
      input: content,
      encoding: 'utf8',
    });

    return !result.error && result.status === 0;
  }
}
