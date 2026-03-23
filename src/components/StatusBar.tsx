import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';
import { getApiCallCount } from '../lib/nansen.js';

type NotificationType = 'info' | 'warn' | 'error';

interface StatusBarProps {
  apiCallCount: number;
  lastRefresh: Date | null;
  isStreaming: boolean;
  error?: string | null;
  notification?: { message: string; type: NotificationType } | null;
}

export default function StatusBar({ apiCallCount: initialApiCallCount, lastRefresh, isStreaming, error, notification }: StatusBarProps) {
  const [count, setCount] = useState(initialApiCallCount);

  // Sync count if prop changes (e.g. from parent re-renders or tests)
  useEffect(() => {
    setCount(initialApiCallCount);
  }, [initialApiCallCount]);

  // Poll for the latest API call count to stay fresh without App re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      const currentGlobalCount = getApiCallCount();
      // Only update if it grew beyond the initial/current
      if (currentGlobalCount > 0) {
        setCount(prev => Math.max(prev, currentGlobalCount));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
        <Text color="white">{count} API call{count === 1 ? '' : 's'}</Text>
        <Text color="gray"> · </Text>
        <Text color="white">Last refresh: {timeStr}</Text>
      </Box>
      <Box>
        {isStreaming && <Text color="magenta">● STREAMING  </Text>}
        {notification && (
          <Text
            color={notification.type === 'error' ? 'red' : notification.type === 'warn' ? 'yellow' : 'cyan'}
            bold
          >
            {notification.message}
          </Text>
        )}
      </Box>
    </Box>
  );
}
