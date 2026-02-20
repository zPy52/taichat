import express from 'express';
import crypto from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { SubmoduleChatServerServiceHandler } from '@/services/chat-server/handler';

export type { PendingToolCall } from '@/services/chat-server/types';

interface ChatServerCredentials {
  port: number;
  token: string;
}

export class ChatServerService {
  private static port: number | null = null;
  private static token: string | null = null;
  private static server: Server | null = null;

  public static async start(): Promise<ChatServerCredentials> {
    if (ChatServerService.server && ChatServerService.token && ChatServerService.port) {
      return { port: ChatServerService.port, token: ChatServerService.token };
    }

    ChatServerService.token = crypto.randomBytes(32).toString('hex');

    const app = express();
    const handler = new SubmoduleChatServerServiceHandler({
      validateToken: (token) => ChatServerService.validateToken(token),
    });

    app.use(express.json({ limit: '2mb' }));

    app.post('/api/chat', async (req, res) => {
      try {
        await handler.processChatRequest(req, res);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unexpected chat server error.',
        });
      }
    });

    const server = await new Promise<Server>((resolve, reject) => {
      const nextServer = app.listen(0, '127.0.0.1', () => resolve(nextServer));
      nextServer.on('error', reject);
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      server.close();
      throw new Error('Failed to resolve local chat server address.');
    }

    ChatServerService.server = server;
    ChatServerService.port = (address as AddressInfo).port;

    return {
      port: ChatServerService.port,
      token: ChatServerService.token,
    };
  }

  public static validateToken(token: string): boolean {
    return token.length > 0 && token === ChatServerService.token;
  }
}
