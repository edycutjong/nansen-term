import { useState, useEffect, useRef, useCallback } from 'react';
import { spawnNansenStream } from '../lib/nansen.js';
import type { ChildProcess } from 'node:child_process';

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
  const bufferRef = useRef('');

  const stop = useCallback(() => {
    if (processRef.current) {
      processRef.current.kill();
      processRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const start = useCallback(() => {
    stop(); // Kill any existing process
    setError(null);
    setIsStreaming(true);

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
