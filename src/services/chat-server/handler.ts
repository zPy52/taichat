import { Get } from 'getrx';
import { Const } from '@/const';
import { Tools } from '@/tools';
import type { Request, Response } from 'express';
import { ChatController } from '@/controllers/chat';
import { ConfigController } from '@/controllers/config';
import { AiProviderService } from '@/services/providers';
import type { ToolExecutionOptions } from '@ai-sdk/provider-utils';
import type { PendingToolCall } from '@/services/chat-server/types';
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';

interface ChatRequestBody {
  messages: UIMessage[];
}

type ValidateTokenFn = (token: string) => boolean;

export class SubmoduleChatServerServiceHandler {
  private readonly validateToken: ValidateTokenFn;

  public constructor({ validateToken }: { validateToken: ValidateTokenFn }) {
    this.validateToken = validateToken;
  }

  public async processChatRequest(req: Request, res: Response): Promise<void> {
    if (!this.isAuthorized(req)) {
      res.status(401).json({ error: 'Unauthorized request.' });
      return;
    }

    const body = req.body as Partial<ChatRequestBody>;
    if (!Array.isArray(body.messages)) {
      res.status(400).json({ error: 'Invalid request body.' });
      return;
    }

    const configController = Get.find(ConfigController)!;
    const config = configController.config.value!;
    const modelId = configController.modelId.value!;

    const exaApiKey = ConfigController.apiKeys.get('exa', config);
    if (exaApiKey) {
      process.env.EXA_API_KEY = exaApiKey;
    }

    const tools = this.getTools();
    const modelMessages = await convertToModelMessages(body.messages, {
      tools,
      ignoreIncompleteToolCalls: true,
    });

    const result = streamText({
      model: AiProviderService.getModel(modelId, config),
      system: Const.prompts.SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(50),
    });

    result.pipeUIMessageStreamToResponse(res);
  }

  private isAuthorized(req: Request): boolean {
    const token = req.get('X-Chat-Token');
    return !!token && this.validateToken(token);
  }

  private getTools(): ReturnType<typeof Tools.allTools> {
    const tools = Tools.allTools();
    type ToolEntry = (typeof tools)[keyof typeof tools];
    const guardedTools: Record<string, ToolEntry> = {} as Record<string, ToolEntry>;

    for (const [toolName, toolDefinition] of Object.entries(tools)) {
      if (
        Tools.isDangerous(toolName) &&
        'execute' in toolDefinition &&
        typeof toolDefinition.execute === 'function'
      ) {
        const originalExecute = toolDefinition.execute as (
          args: Record<string, unknown>,
          options: ToolExecutionOptions,
        ) => Promise<unknown>;
        const wrappedTool: ToolEntry = {
          ...toolDefinition,
          execute: async (args: Record<string, unknown>, options: ToolExecutionOptions) => {
            const pendingToolCall: PendingToolCall = {
              toolCallId: options.toolCallId,
              toolName,
              args,
            };

            const approval = await Get.find(ChatController)!.toolApproval.request(pendingToolCall);
            if (approval === 'denied') {
              return { error: 'Tool call was denied by the user.' };
            }

            return await originalExecute(args, options);
          },
        } as ToolEntry;
        guardedTools[toolName] = wrappedTool;
        continue;
      }

      guardedTools[toolName] = toolDefinition as ToolEntry;
    }

    return guardedTools as ReturnType<typeof Tools.allTools>;
  }
}
