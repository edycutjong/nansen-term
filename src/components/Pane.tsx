import React from 'react';
import { Box, Text } from 'ink';

interface PaneProps {
  title: string;
  emoji?: string;
  isActive?: boolean;
  width?: string | number;
  height?: string | number;
  children: React.ReactNode;
}

export default function Pane({ title, emoji, isActive = false, width, height, children }: PaneProps) {
  const borderColor = isActive ? 'cyan' : 'gray';
  const titleColor = isActive ? 'cyan' : 'white';

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle="single"
      borderColor={borderColor}
      width={width}
      height={height ?? '100%'}
      paddingX={1}
    >
      <Box>
        <Text color={titleColor} bold>
          {emoji ? `${emoji} ` : ''}{title.toUpperCase()}
        </Text>
        {isActive && <Text color="cyan"> ◀</Text>}
      </Box>
      <Box flexDirection="column" flexGrow={1} marginTop={1}>
        {children}
      </Box>
    </Box>
  );
}
