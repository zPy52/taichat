import { marked } from 'marked';
// @ts-expect-error marked-terminal has no type declarations
import { markedTerminal } from 'marked-terminal';

const ANSI_BOLD_OPEN = '\u001b[1m';
const ANSI_BOLD_CLOSE = '\u001b[22m';

marked.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  markedTerminal({
    showSectionPrefix: false,
    reflowText: true,
    width: Math.min(process.stdout.columns || 80, 100),
    tab: 2,
  }),
);

function cleanupResidualMarkdown(text: string): string {
  return text
    .replace(/^\s*[*+-]\s*$/gm, '')
    .replace(/^(\s*)[*+-]\s+/gm, '$1• ')
    .replace(/\*\*([^*]+)\*\*/g, `${ANSI_BOLD_OPEN}$1${ANSI_BOLD_CLOSE}`)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
}

export function renderMarkdown(text: string): string {
  try {
    const rendered = marked.parse(text);
    if (typeof rendered === 'string') {
      return cleanupResidualMarkdown(rendered);
    }
    return cleanupResidualMarkdown(text);
  } catch {
    return cleanupResidualMarkdown(text);
  }
}
