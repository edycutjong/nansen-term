import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  apiCallCount: number;
  lastRefresh: Date | null;
  isStreaming: boolean;
  error?: string | null;
}

export default function StatusBar({ apiCallCount, lastRefresh, isStreaming, error }: StatusBarProps) {
  const timeStr = lastRefresh
    ? lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    : '—';

  return (
    <Box paddingX={1} justifyContent="space-between">
      <Box>
        {error ? (
          <Text color="red">✗ {error}</Text>
        ) : (
          <Text color="green">✓ Connected</Text>
        )}
        <Text color="gray"> · </Text>
        <Text color="white">{apiCallCount} API calls</Text>
        <Text color="gray"> · </Text>
        <Text color="white">Last refresh: {timeStr}</Text>
      </Box>
      <Box>
        {isStreaming && <Text color="magenta">● STREAMING</Text>}
      </Box>
    </Box>
  );
}
