import { z } from 'zod';
import { tool } from 'ai';

export const executeCommand = tool({
  description:
    'Execute a shell command. Use this only when no dedicated tool exists for the task. The user will be asked for approval before execution.',
  inputSchema: z.object({
    command: z.string().describe('The shell command to execute'),
    cwd: z.string().optional().describe('Working directory for the command (defaults to current directory)'),
  }),
});
