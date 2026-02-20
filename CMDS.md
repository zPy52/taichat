# TaiChat — Walkthrough & Commands

## Codebase walkthrough

**TaiChat** is a multi-provider AI chat CLI that runs in the terminal. It’s an npm package that builds to a single ESM bundle and exposes two bin names: `taichat` and `chat`.

### Layout

| Path | Purpose |
|------|--------|
| `src/cli.tsx` | Entrypoint: parses `--help` / `--version`, then renders the Ink app. |
| `src/app.tsx` | Root UI: shows config setup when no API keys exist, otherwise `<TerminalChat>`. |
| `src/agent.ts` | AI loop: `streamText` from Vercel AI SDK, handles tool calls, approval for dangerous tools, and message history. |
| `src/providers.ts` | Model list and `resolveModel()` for OpenAI, Anthropic, DeepSeek, DeepInfra, Kimi (OpenAI-compatible). |
| `src/config.ts` | Load/save config at `~/.taichat/config.json`; API keys can also come from env vars. |
| `src/tools/` | Tools: `file-tools`, `shell-tool`, `web-search`; aggregated in `index.ts` with safe vs dangerous sets. |
| `src/components/` | Ink UI: header, chat input, message history, model selector, tool-call review, help, config setup. |
| `tsup.config.ts` | Single ESM bundle from `src/cli.tsx` → `dist/cli.js`, with node shebang and `require` shim for CJS deps. |

### Build & publish surface

- **Entry:** `src/cli.tsx` (tsup).
- **Output:** `dist/cli.js` (and source map). `package.json` has `"files": ["dist"]`, so only `dist/` is published.
- **Bins:** `taichat` and `chat` both point to `./dist/cli.js`. `prepublishOnly` runs `npm run build`.

---

## 1. Publish the package

From the project root:

```bash
# Install dependencies (if not already)
npm install

# Build (generates dist/cli.js; also runs automatically before publish)
npm run build

# Log in to npm (one-time per machine; requires npm account)
npm login

# Bump version if desired (optional)
npm version patch
# or: npm version minor
# or: npm version major

# Publish to npm (prepublishOnly will run build again)
npm publish
```

To publish a pre-release (e.g. beta):

```bash
npm version prerelease --preid=beta
npm publish --tag beta
```

---

## 2. Install and use

### Install (global CLI)

```bash
npm install -g taichat
```

### Run

```bash
taichat
```

or use the alias:

```bash
chat
```

### First run

On first run you’ll be asked to set up API keys. Config is stored at `~/.taichat/config.json`. You can also set keys via env:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` (for Anthropic/Claude models)
- `EXA_API_KEY` (for web search)

### In-chat slash commands

- `/model` — switch model  
- `/clear` — clear history  
- `/config` — reconfigure API keys  
- `/help` — list commands  

### CLI flags

```bash
taichat --help    # or -h
taichat --version # or -v
```

### Install a specific version

```bash
npm install -g taichat
# or
npm install -g taichat@latest
```

### Run without installing (npx)

```bash
npx taichat
```
