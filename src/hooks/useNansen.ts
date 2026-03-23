import { useState, useCallback, useEffect } from 'react';
import { execNansen } from '../lib/nansen.js';
import { IS_MOCK, getMockData } from '../lib/mock.js';
import type { NansenResponse } from '../types/nansen.js';

interface UseNansenResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * React hook that executes a Nansen CLI command and manages state.
 * Set NANSEN_MOCK=1 to use fake data without burning API credits.
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
      // Mock mode: return fake data instantly, no CLI call
      if (IS_MOCK) {
        await new Promise((r) => setTimeout(r, 300)); // simulate brief load
        const mock = getMockData(command);
        if (mock !== null) {
          setData(mock as T);
        } else {
          setError('[MOCK] No mock data for: ' + command);
        }
        return;
      }

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
