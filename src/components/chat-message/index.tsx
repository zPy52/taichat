import React from 'react';
import { Text } from 'ink';
import { Tools } from '@/tools';
import { UserMessage } from '@/components/chat-message/messages/user';
import type { ChatMessageProps } from '@/components/chat-message/types';
import { ToolCallMessage } from '@/components/chat-message/messages/tools/call';
import { AssistantMessage } from '@/components/chat-message/messages/assistant';
import { ToolResultMessage } from '@/components/chat-message/messages/tools/result';

export type { ChatMessageData, MessageRole } from '@/components/chat-message/types';

function ChatMessageComponent({ message }: ChatMessageProps): React.ReactElement {
  switch (message.role) {
    case 'user':
      return <UserMessage content={message.content} />;
    case 'assistant':
      return <AssistantMessage content={message.content} />;
    case 'tool-call':
      return <ToolCallMessage toolName={message.toolName} toolArgs={message.toolArgs} />;
    case 'tool-result':
      return (
        <ToolResultMessage
          toolName={message.toolName}
          content={message.content}
          toolArgs={message.toolArgs}
        />
      );
    default:
      return <Text>{message.content}</Text>;
  }
}

const ChatMessage = React.memo(
  ChatMessageComponent,
  (prevProps, nextProps) =>
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.toolName === nextProps.message.toolName &&
    Tools.utils.hasSameArgs(prevProps.message.toolArgs, nextProps.message.toolArgs),
);

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
