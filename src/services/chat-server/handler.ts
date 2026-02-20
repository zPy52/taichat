import { Get } from 'getrx';
import { Const } from '@/const';
import { Tools } from '@/tools';
import type { Request, Response } from 'express';
import { ConfigController } from '@/controllers/config';
import { AiProviderService } from '@/services/providers';
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

    const tools = Tools.allTools();
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

}
