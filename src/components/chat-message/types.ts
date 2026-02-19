export type MessageRole = 'user' | 'assistant' | 'tool-call' | 'tool-result';

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

export interface ChatMessageProps {
  message: ChatMessageData;
}

export interface UserMessageProps {
  content: string;
}

export interface AssistantMessageProps {
  content: string;
}

export interface ToolCallMessageProps {
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

export interface ToolResultMessageProps {
  toolName?: string;
  content: string;
}
