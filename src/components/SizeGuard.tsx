import React from 'react';
import { Box, Text, useStdout } from 'ink';

const MIN_WIDTH = 120;
const MIN_HEIGHT = 30;

interface SizeGuardProps {
  children: React.ReactNode;
}

export default function SizeGuard({ children }: SizeGuardProps) {
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 0;
  const rows = stdout?.rows ?? 0;

  if (cols < MIN_WIDTH || rows < MIN_HEIGHT) {
    return (
      <Box flexDirection="column" borderStyle="single" borderColor="red" paddingX={2} paddingY={1}>
        <Text color="red" bold>⚠ Terminal too small</Text>
        <Text> </Text>
        <Text color="white">NansenTerm needs at least <Text bold>{MIN_WIDTH}×{MIN_HEIGHT}</Text> characters.</Text>
        <Text color="gray">Current size: {cols}×{rows}</Text>
        <Text> </Text>
        <Text color="gray">Resize your terminal window and try again.</Text>
      </Box>
    );
  }

  return <>{children}</>;
}
