export const commands = [
  { cmd: '/model', desc: 'Switch the active AI model' },
  { cmd: '/clear', desc: 'Clear the chat history' },
  { cmd: '/copy', desc: 'Copy the last assistant message' },
  { cmd: '/config', desc: 'Re-configure API keys' },
  { cmd: '/help', desc: 'Show this help message' },
] as const;
