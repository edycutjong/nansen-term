import { useState, useEffect, useRef, useCallback } from 'react';
import { spawnNansenStream } from '../lib/nansen.js';
import type { ChildProcess } from 'node:child_process';
import { IS_MOCK, getMockData } from '../lib/mock.js';

interface UseStreamResult<T> {
  items: T[];
  isStreaming: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * React hook for NDJSON streaming from a Nansen CLI command.
 * Parses line-by-line JSON and accumulates items.
 */
export function useStream<T = unknown>(
  command: string,
  args: string[] = [],
  maxItems = 50,
): UseStreamResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processRef = useRef<ChildProcess | null>(null);
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bufferRef = useRef('');

  const stop = useCallback(() => {
    if (processRef.current) {
      processRef.current.kill();
      processRef.current = null;
    }
    if (mockTimerRef.current) {
      clearInterval(mockTimerRef.current);
      mockTimerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const start = useCallback(() => {
    stop(); // Kill any existing process/timer
    setError(null);
    setIsStreaming(true);

    if (IS_MOCK) {
      mockTimerRef.current = setInterval(() => {
        const mockArray = getMockData(command, args) as T[];
        if (Array.isArray(mockArray) && mockArray.length > 0) {
          const item = mockArray[0]!;
          setItems((prev) => {
            const next = [item, ...prev];
            return next.slice(0, maxItems);
          });
        }
      }, 2000);
      return;
    }

    const proc = spawnNansenStream(command, args);
    processRef.current = proc;

    proc.stdout?.on('data', (chunk: Buffer) => {
      bufferRef.current += chunk.toString();
      const lines = bufferRef.current.split('\n');
      bufferRef.current = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.success === false) {
             setError(parsed.error || 'Stream error');
             stop();
             return;
          }
          const item = parsed.data ?? parsed;
          setItems((prev) => {
            const next = [item as T, ...prev];
            return next.slice(0, maxItems);
          });
        } catch {
          // Skip unparseable lines
        }
      }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      setError(chunk.toString().trim());
    });

    proc.on('close', () => {
      setIsStreaming(false);
      processRef.current = null;
    });

    proc.on('error', (err: Error) => {
      setError(err.message);
      setIsStreaming(false);
    });
  }, [command, args.join(','), maxItems, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { items, isStreaming, error, start, stop };
}
