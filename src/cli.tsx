import App from '@/app';
import { render } from 'ink';

const VERSION = '0.1.3';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  TaiChat v${VERSION}
  Multi-provider AI chat agent for your terminal.

  Usage:
    taichat              Start interactive chat
    taichat --help       Show this help message
    taichat --version    Show version

  Slash Commands (inside chat):
    /model     Switch the active AI model
    /clear     Clear chat history
    /copy      Copy the last assistant message
    /config    Re-configure API keys
    /help      Show available commands

  Environment Variables:
    OPENAI_API_KEY       OpenAI API key
    ANTHROPIC_API_KEY    Anthropic API key
    EXA_API_KEY          Exa AI (web search) API key
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(VERSION);
  process.exit(0);
}

render(<App version={VERSION} />);
