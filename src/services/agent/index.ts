import { Const } from '@/const';
import type { AppConfig } from '@/controllers/config';
import { Tools } from '@/tools';
import { AiProviderService } from '@/services/providers';
import type { ToolExecutionOptions } from '@ai-sdk/provider-utils';
import type { AgentCallbacks, PendingToolCall } from '@/services/agent/types';
import { ToolLoopAgent, stepCountIs, type ToolSet, type ModelMessage } from 'ai';

export type { AgentCallbacks, PendingToolCall, ToolApprovalStatus } from '@/services/agent/types';

export class AgentService {
  private static buildTools(callbacks: AgentCallbacks): ToolSet {
    const tools: ToolSet = {};

    for (const [name, toolDef] of Object.entries(Tools.allTools())) {
      if (Tools.isDangerous(name) && 'execute' in toolDef && typeof toolDef.execute === 'function') {
        const originalExecute = toolDef.execute;
        tools[name] = {
          ...toolDef,
          execute: async (args: Record<string, unknown>, options: ToolExecutionOptions) => {
            const pending: PendingToolCall = {
              toolCallId: options.toolCallId,
              toolName: name,
              args,
            };
            const approval = await callbacks.requestToolApproval(pending);
            if (approval === 'denied') {
              return { error: 'Tool call was denied by the user.' };
            }
            return await (originalExecute as any)(args, options);
          },
        };
      } else {
        tools[name] = toolDef;
      }
    }

    return tools;
  }

  public static async run(
    messages: ModelMessage[],
    modelId: string,
    config: AppConfig,
    callbacks: AgentCallbacks,
    abortSignal?: AbortSignal,
  ): Promise<ModelMessage[]> {
    const agent = new ToolLoopAgent({
      model: AiProviderService.getModel(modelId, config),
      instructions: Const.prompts.SYSTEM_PROMPT,
      tools: AgentService.buildTools(callbacks),
      stopWhen: stepCountIs(50),
    });

    let streamResult;
    try {
      streamResult = await agent.stream({ messages, abortSignal });
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      return messages;
    }

    try {
      for await (const part of streamResult.fullStream) {
        if (abortSignal?.aborted) {
          break;
        }

        if (part.type === 'text-delta') {
          callbacks.onTextDelta(part.text);
        } else if (part.type === 'reasoning-start') {
          callbacks.onReasoningStart();
        } else if (part.type === 'reasoning-delta') {
          callbacks.onReasoningDelta(part.text);
        } else if (part.type === 'reasoning-end') {
          callbacks.onReasoningEnd();
        } else if (part.type === 'tool-call') {
          callbacks.onToolCall({
            toolCallId: part.toolCallId,
            toolName: part.toolName,
            args: (part.input && typeof part.input === 'object' ? part.input : {}) as Record<
              string,
              unknown
            >,
          });
        } else if (part.type === 'tool-result') {
          callbacks.onToolResult(part.toolCallId, part.toolName, part.output);
        }
      }
    } catch (error) {
      if (!abortSignal?.aborted) {
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      }
      return messages;
    }

    callbacks.onFinish();

    const response = await streamResult.response;
    return [...messages, ...response.messages];
  }
}
