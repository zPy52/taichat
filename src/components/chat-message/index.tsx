import React from 'react';
import { Text } from 'ink';
import { AssistantMessage } from '@/components/chat-message/assistant-message';
import { ToolCallMessage } from '@/components/chat-message/tool-call-message';
import { ToolResultMessage } from '@/components/chat-message/tool-result-message';
import type { ChatMessageProps } from '@/components/chat-message/types';
import { UserMessage } from '@/components/chat-message/user-message';

export type { ChatMessageData, MessageRole } from '@/components/chat-message/types';

export default function ChatMessage({ message }: ChatMessageProps): React.ReactElement {
  switch (message.role) {
    case 'user':
      return <UserMessage content={message.content} />;
    case 'assistant':
      return <AssistantMessage content={message.content} />;
    case 'tool-call':
      return <ToolCallMessage toolName={message.toolName} toolArgs={message.toolArgs} />;
    case 'tool-result':
      return <ToolResultMessage toolName={message.toolName} content={message.content} />;
    default:
      return <Text>{message.content}</Text>;
  }
}
