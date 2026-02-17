import React from 'react';
import { render } from 'ink';
import App from '@/app';

const VERSION = '0.1.0';

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
    /config    Re-configure API keys
    /help      Show available commands

  Environment Variables:
    OPENAI_API_KEY       OpenAI API key
    ANTHROPIC_API_KEY    Anthropic API key
    DEEPSEEK_API_KEY     DeepSeek API key
    DEEPINFRA_API_KEY    DeepInfra API key
    KIMI_API_KEY         Kimi/Moonshot API key
    EXA_API_KEY          Exa AI (web search) API key
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(VERSION);
  process.exit(0);
}

render(<App version={VERSION} />);
