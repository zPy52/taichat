# TaiChat

Multi-provider AI chat agent for your terminal. Talk to OpenAI, Anthropic, DeepSeek, DeepInfra, Kimi and more — with local tool calling and permission prompts.

## Install

```bash
npm install -g taichat
```

## Usage

```bash
taichat
# or
chat
```

## Features

- Chat with models from OpenAI, Anthropic, DeepSeek, DeepInfra, Kimi
- Local tool calling: file operations, shell commands, web search
- Permission prompts for dangerous operations
- Switch models on the fly with `/model`
- Markdown rendering in the terminal
- Web search via Exa AI

## Configuration

On first run, TaiChat will prompt you to enter API keys. Config is stored at `~/.taichat/config.json`.

You can also set API keys via environment variables:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`
- `DEEPINFRA_API_KEY`
- `KIMI_API_KEY`
- `EXA_API_KEY`

## Slash Commands

- `/model` — Switch the active model
- `/clear` — Clear chat history
- `/config` — Re-run API key setup
- `/help` — Show available commands

## License

Apache-2.0
