import { z } from 'zod';
import fs from 'node:fs';
import { tool } from 'ai';
import path from 'node:path';

export const readFile = tool({
  description: 'Read the contents of a file at the given path. Use this to inspect files.',
  inputSchema: z.object({
    filePath: z.string().describe('Absolute or relative path to the file to read'),
  }),
  execute: async ({ filePath }) => {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      return { error: `File not found: ${resolved}` };
    }
    const content = fs.readFileSync(resolved, 'utf-8');
    return { path: resolved, content };
  },
});

export const writeFile = tool({
  description:
    'Write content to a file, creating it if it does not exist. Prefer this over shell commands for writing files.',
  inputSchema: z.object({
    filePath: z.string().describe('Absolute or relative path to write to'),
    content: z.string().describe('The content to write to the file'),
  }),
});

export const removeFile = tool({
  description:
    'Delete a file at the given path. Prefer this tool over shell commands like rm.',
  inputSchema: z.object({
    filePath: z.string().describe('Absolute or relative path to the file to delete'),
  }),
});

export const listDirectory = tool({
  description: 'List files and directories at the given path.',
  inputSchema: z.object({
    dirPath: z.string().describe('Absolute or relative path to the directory to list').default('.'),
  }),
  execute: async ({ dirPath }) => {
    const resolved = path.resolve(dirPath);
    if (!fs.existsSync(resolved)) {
      return { error: `Directory not found: ${resolved}` };
    }
    const entries = fs.readdirSync(resolved, { withFileTypes: true });
    const items = entries.map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' as const : 'file' as const,
    }));
    return { path: resolved, items };
  },
});
