import React, { memo, useMemo } from 'react';
import { Box, Text } from 'ink';
import { marked } from 'marked';
import { COLORS } from '@/utils/colors';
import { renderMarkdown } from '@/utils/markdown';
import type { AssistantMessageProps } from '@/components/chat-message/types';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw).filter(Boolean);
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }): React.ReactElement => <Text>{renderMarkdown(content)}</Text>,
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

function AssistantMessageComponent({ content }: AssistantMessageProps): React.ReactElement {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

  return (
    <Box flexDirection="column" marginY={0}>
      <Box gap={1}>
        <Text bold color={COLORS.assistantLabel}>{'●'}</Text>
        <Text bold color={COLORS.assistantLabel}>TaiChat</Text>
      </Box>
      <Box marginLeft={2} flexDirection="column">
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock key={`assistant-block-${index}`} content={block} />
        ))}
      </Box>
    </Box>
  );
}

export const AssistantMessage = memo(
  AssistantMessageComponent,
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

AssistantMessage.displayName = 'AssistantMessage';
