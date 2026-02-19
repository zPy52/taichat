import { z } from 'zod';
import fs from 'node:fs';
import { tool } from 'ai';
import path from 'node:path';
import { spawn } from 'node:child_process';

export class SubmoduleToolsShell {
  private static readonly MAX_OUTPUT_CHARS = 24_000;

  private appendOutputChunk(current: string, chunk: string): string {
    if (current.length >= SubmoduleToolsShell.MAX_OUTPUT_CHARS) {
      return current;
    }
    const next = current + chunk;
    return next.length > SubmoduleToolsShell.MAX_OUTPUT_CHARS
      ? next.slice(0, SubmoduleToolsShell.MAX_OUTPUT_CHARS)
      : next;
  }

  public execute() {
    return tool({
      description:
        'Execute a shell command. Use this only when no dedicated tool exists for the task. The user will be asked for approval before execution.',
      inputSchema: z.object({
        command: z.string().describe('The shell command to execute'),
        cwd: z.string().optional().describe('Working directory for the command (defaults to current directory)'),
      }),
      execute: async ({ command, cwd }) => {
        const resolvedCwd = cwd ? path.resolve(cwd) : process.cwd();

        if (!fs.existsSync(resolvedCwd)) {
          return { error: `Working directory not found: ${resolvedCwd}` };
        }
        if (!fs.statSync(resolvedCwd).isDirectory()) {
          return { error: `Working directory is not a directory: ${resolvedCwd}` };
        }

        return await new Promise((resolve) => {
          const child = spawn(command, {
            cwd: resolvedCwd,
            shell: true,
            env: process.env,
          });

          let stdout = '';
          let stderr = '';

          child.stdout?.on('data', (chunk: Buffer | string) => {
            stdout = this.appendOutputChunk(stdout, chunk.toString());
          });
          child.stderr?.on('data', (chunk: Buffer | string) => {
            stderr = this.appendOutputChunk(stderr, chunk.toString());
          });

          child.on('error', (error) => {
            resolve({
              cwd: resolvedCwd,
              error: error.message,
            });
          });

          child.on('close', (code) => {
            resolve({
              cwd: resolvedCwd,
              exitCode: code ?? 0,
              stdout: stdout.trimEnd(),
              stderr: stderr.trimEnd(),
              truncated:
                stdout.length >= SubmoduleToolsShell.MAX_OUTPUT_CHARS ||
                stderr.length >= SubmoduleToolsShell.MAX_OUTPUT_CHARS,
            });
          });
        });
      },
    });
  }
}
