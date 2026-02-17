import { marked } from 'marked';
// @ts-expect-error marked-terminal has no type declarations
import TerminalRenderer from 'marked-terminal';

let rendererConfigured = false;

function ensureRenderer(): void {
  if (!rendererConfigured) {
    marked.setOptions({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      renderer: new TerminalRenderer({
        reflowText: true,
        width: Math.min(process.stdout.columns || 80, 100),
        tab: 2,
      }),
    });
    rendererConfigured = true;
  }
}

export function renderMarkdown(text: string): string {
  ensureRenderer();
  try {
    const rendered = marked.parse(text);
    if (typeof rendered === 'string') {
      return rendered.trimEnd();
    }
    return text;
  } catch {
    return text;
  }
}
