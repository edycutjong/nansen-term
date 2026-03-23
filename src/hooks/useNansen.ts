import { useState, useCallback, useEffect } from 'react';
import { execNansen } from '../lib/nansen.js';
import type { NansenResponse } from '../types/nansen.js';

interface UseNansenResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook that executes a Nansen CLI command and manages state.
 * Auto-fetches on mount and when command/args change.
 */
export function useNansen<T = unknown>(
  command: string,
  args: string[] = [],
  autoFetch = true,
): UseNansenResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const argsKey = args.join(',');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await execNansen<T>(command, args);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to execute command');
    } finally {
      setLoading(false);
    }
  }, [command, argsKey]);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [refresh, autoFetch]);

  return { data, loading, error, refresh };
}
