import { streamText, type ModelMessage, type ToolContent } from 'ai';
import { resolveModel } from '@/providers';
import { allTools, isDangerousTool } from '@/tools';
import type { AppConfig } from '@/config';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export type ToolApprovalStatus = 'approved' | 'denied';

export interface PendingToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface AgentCallbacks {
  onTextDelta: (delta: string) => void;
  onToolCall: (toolCall: PendingToolCall) => void;
  onToolResult: (toolCallId: string, toolName: string, result: unknown) => void;
  onFinish: () => void;
  onError: (error: Error) => void;
  requestToolApproval: (toolCall: PendingToolCall) => Promise<ToolApprovalStatus>;
}

const SYSTEM_PROMPT = `You are TermiChat, a helpful AI assistant running in the user's terminal. You have access to local tools for file operations, shell commands, and web search.

Important guidelines:
- When you need to manipulate files, ALWAYS prefer using the dedicated file tools (read_file, write_file, remove_file, list_directory) over shell commands.
- Only use execute_command when there is no dedicated tool for the task (e.g., running builds, git operations, package managers).
- When showing code or technical content, use markdown formatting with code blocks.
- Be concise but thorough. The terminal has limited width so keep responses readable.
- If a task requires multiple steps, explain your plan before executing.
- The user's current working directory is: ${process.cwd()}`;

export async function runAgent(
  messages: ModelMessage[],
  modelId: string,
  config: AppConfig,
  callbacks: AgentCallbacks,
  abortSignal?: AbortSignal,
): Promise<ModelMessage[]> {
  const model = resolveModel(modelId, config);
  const updatedMessages = [...messages];

  const maxIterations = 10;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: updatedMessages,
      tools: allTools,
      abortSignal,
    });

    let fullText = '';
    const toolCalls: Array<{ toolCallId: string; toolName: string; input: unknown }> = [];

    try {
      for await (const part of result.fullStream) {
        if (abortSignal?.aborted) return updatedMessages;

        switch (part.type) {
          case 'text-delta':
            fullText += part.text;
            callbacks.onTextDelta(part.text);
            break;
          case 'tool-call':
            toolCalls.push({
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              input: part.input,
            });
            break;
        }
      }
    } catch (err) {
      if (abortSignal?.aborted) return updatedMessages;
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      return updatedMessages;
    }

    if (fullText) {
      updatedMessages.push({ role: 'assistant', content: fullText });
    }

    if (toolCalls.length === 0) {
      callbacks.onFinish();
      return updatedMessages;
    }

    const assistantContent: Array<{ type: 'text'; text: string } | { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown }> = [];
    if (fullText) {
      updatedMessages.pop();
      assistantContent.push({ type: 'text', text: fullText });
    }
    for (const tc of toolCalls) {
      assistantContent.push({
        type: 'tool-call',
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        input: tc.input,
      });
    }
    updatedMessages.push({ role: 'assistant', content: assistantContent });

    const toolResults: ToolContent = [];

    for (const tc of toolCalls) {
      const args = (tc.input && typeof tc.input === 'object' ? tc.input : {}) as Record<string, unknown>;
      const pending: PendingToolCall = {
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        args,
      };

      callbacks.onToolCall(pending);

      let toolResult: unknown;

      if (isDangerousTool(tc.toolName)) {
        const approval = await callbacks.requestToolApproval(pending);

        if (approval === 'denied') {
          toolResults.push({
            type: 'tool-result',
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            output: { type: 'execution-denied' as const, reason: 'Denied by user' },
          });
          callbacks.onToolResult(tc.toolCallId, tc.toolName, { error: 'Tool call was denied by the user.' });
          continue;
        } else {
          toolResult = await executeTool(tc.toolName, args);
        }
      } else {
        toolResult = await executeSafeTool(tc.toolName, args);
      }

      callbacks.onToolResult(tc.toolCallId, tc.toolName, toolResult);

      toolResults.push({
        type: 'tool-result',
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        output: { type: 'json' as const, value: toolResult as import('ai').JSONValue },
      });
    }

    updatedMessages.push({ role: 'tool', content: toolResults });
  }

  callbacks.onFinish();
  return updatedMessages;
}

async function executeSafeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const toolDef = allTools[toolName as keyof typeof allTools];
  if (!toolDef || !('execute' in toolDef) || typeof toolDef.execute !== 'function') {
    return { error: `Tool "${toolName}" not found or has no execute function.` };
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (toolDef.execute as any)(args, {});
  } catch (err) {
    return { error: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (toolName) {
    case 'write_file': {
      const filePath = path.resolve(args.filePath as string);
      const content = args.content as string;
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, path: filePath };
      } catch (err) {
        return { error: `Failed to write file: ${err instanceof Error ? err.message : String(err)}` };
      }
    }
    case 'remove_file': {
      const filePath = path.resolve(args.filePath as string);
      try {
        fs.unlinkSync(filePath);
        return { success: true, path: filePath };
      } catch (err) {
        return { error: `Failed to remove file: ${err instanceof Error ? err.message : String(err)}` };
      }
    }
    case 'execute_command': {
      const command = args.command as string;
      const cwd = args.cwd ? path.resolve(args.cwd as string) : process.cwd();
      try {
        const output = execSync(command, {
          cwd,
          timeout: 30000,
          maxBuffer: 1024 * 1024,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        return { exitCode: 0, output: output.trim() };
      } catch (err: unknown) {
        const execErr = err as { status?: number; stdout?: string; stderr?: string; message?: string };
        return {
          exitCode: execErr.status ?? 1,
          output: execErr.stdout || '',
          error: execErr.stderr || execErr.message || 'Command failed',
        };
      }
    }
    default:
      return executeSafeTool(toolName, args);
  }
}
