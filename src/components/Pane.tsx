import React from 'react';
import { Box, Text } from 'ink';

interface PaneProps {
  title: string;
  emoji?: string;
  isActive?: boolean;
  paneNumber?: number;
  width?: string | number;
  height?: string | number;
  children: React.ReactNode;
}

export default function Pane({ title, emoji, isActive = false, paneNumber, width, height, children }: PaneProps) {
  const borderColor = isActive ? 'cyan' : 'gray';
  const titleColor = isActive ? 'cyan' : 'white';
  const prefix = isActive ? '◂' : paneNumber !== undefined ? String(paneNumber) : '';

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
        <Text color={isActive ? 'cyan' : 'gray'} bold>{prefix} </Text>
      </Box>
      <Box flexDirection="column" flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}

