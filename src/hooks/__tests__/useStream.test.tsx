import { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'ink-testing-library';
import { useStream } from '../useStream.js';
import { Text } from 'ink';
import * as nansenModule from '../../lib/nansen.js';
import * as mockModule from '../../lib/mock.js';
import { EventEmitter } from 'events';
// ChildProcess type is used implicitly via mocking

vi.mock('../../lib/nansen.js', () => ({
  execNansen: vi.fn(),
  spawnNansenStream: vi.fn(),
}));

vi.mock('../../lib/mock.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/mock.js')>();
  return {
    ...actual,
    get IS_MOCK() {
      return (global as any).__MOCK_IS_MOCK ?? false;
    },
    getMockData: vi.fn(),
  };
});

function renderHook<Result>(
  hook: () => Result
): { result: { current: Result | null }, rerender: () => void, unmount: () => void } {
  const result: { current: Result | null } = { current: null };
  const TestComponent = () => {
    result.current = hook();
    return <Text>test</Text>;
  };
  const { rerender, unmount } = render(<TestComponent />);
  return { result, rerender: () => rerender(<TestComponent />), unmount };
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

describe('useStream', () => {
  let mockProcess: any;
  let mockStdout: EventEmitter;
  let mockStderr: EventEmitter;

  beforeEach(() => {
    vi.clearAllMocks();
    (global as any).__MOCK_IS_MOCK = false;

    mockStdout = new EventEmitter();
    mockStderr = new EventEmitter();
    mockProcess = new EventEmitter();
    mockProcess.stdout = mockStdout;
    mockProcess.stderr = mockStderr;
    mockProcess.kill = vi.fn();
    vi.mocked(nansenModule.spawnNansenStream).mockReturnValue(mockProcess as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useStream('cmd'));
    expect(result.current?.items).toEqual([]);
    expect(result.current?.isStreaming).toBe(false);
    expect(result.current?.error).toBeNull();
  });

  it('starts streaming and processes valid JSON lines', async () => {
    const { result } = renderHook(() => useStream('cmd', ['--flag']));
    
    // Call start
    result.current?.start();
    expect(result.current?.isStreaming).toBe(true);
    expect(nansenModule.spawnNansenStream).toHaveBeenCalledWith('cmd', ['--flag']);

    // Emit a chunk containing two complete JSON objects separated by newline
    mockStdout.emit('data', Buffer.from('{"data": {"id": 1}}\n{"id": 2}\n'));
    
    await flushPromises();

    // In useStream, new items are unshifted to the beginning.
    // The items state gets updated twice. For "id: 1", the item is {"id": 1}.
    // For "id: 2", the item is {"id": 2}.
    // Because it unshifts, the latest goes first. Wait, `next = [item, ...prev]`.
    // The loop processes line 0 then line 1.
    // So line 0 unshifts {"id":1}, then line 1 unshifts {"id":2}. 
    // Final array should be [{"id":2}, {"id":1}].
    // Wait, the state updates are queued. Let's force a re-render by yielding to React.
    await flushPromises();

    expect(result.current?.items).toHaveLength(2);
    expect(result.current?.items).toEqual([{ id: 2 }, { id: 1 }]);
  });

  it('accumulates partial JSON chunks', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();

    // Emit partial JSON
    mockStdout.emit('data', Buffer.from('{"id":'));
    await flushPromises();
    expect(result.current?.items).toEqual([]);

    // Finish JSON
    mockStdout.emit('data', Buffer.from('3}\n'));
    await flushPromises();

    expect(result.current?.items).toEqual([{ id: 3 }]);
  });

  it('handles JSON parsing errors gracefully and skips them', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();

    mockStdout.emit('data', Buffer.from('invalid-json\n{"id": 4}\n'));
    await flushPromises();

    expect(result.current?.items).toEqual([{ id: 4 }]);
    expect(result.current?.error).toBeNull();
  });

  it('skips empty and whitespace-only lines in buffer', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();

    // Emit data with empty lines and whitespace-only lines
    mockStdout.emit('data', Buffer.from('\n  \n{"id": 5}\n\n'));
    await flushPromises();

    expect(result.current?.items).toEqual([{ id: 5 }]);
  });

  it('stops stream gracefully when success: false is received', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();

    mockStdout.emit('data', Buffer.from('{"success": false, "error": "API rate limit"}\n'));
    await flushPromises();

    expect(result.current?.items).toEqual([]);
    expect(result.current?.error).toBe('API rate limit');
    expect(result.current?.isStreaming).toBe(false);
    expect(mockProcess.kill).toHaveBeenCalled();
  });

  it('uses default error string if success: false has no error message', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();

    mockStdout.emit('data', Buffer.from('{"success": false}\n'));
    await flushPromises();

    expect(result.current?.error).toBe('Stream error');
  });

  it('processes stderr correctly', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();

    mockStderr.emit('data', Buffer.from('Some error on stderr\n'));
    await flushPromises();

    expect(result.current?.error).toBe('Some error on stderr');
  });

  it('handles child process events (close and error)', async () => {
    const { result } = renderHook(() => useStream('cmd'));
    result.current?.start();
    expect(result.current?.isStreaming).toBe(true);

    mockProcess.emit('error', new Error('Process spawn failed'));
    await flushPromises();
    expect(result.current?.error).toBe('Process spawn failed');
    expect(result.current?.isStreaming).toBe(false);

    // Restart and test close
    result.current?.start();
    expect(result.current?.isStreaming).toBe(true);
    mockProcess.emit('close');
    await flushPromises();
    expect(result.current?.isStreaming).toBe(false);
  });

  it('caps the items array at maxItems', async () => {
    // override maxItems to 2
    const { result } = renderHook(() => useStream('cmd', [], 2));
    result.current?.start();

    // emit 3 items
    mockStdout.emit('data', Buffer.from('{"id": 1}\n{"id": 2}\n{"id": 3}\n'));
    await flushPromises();

    // Should only have the latest 2 items! Which are 3, and 2.
    // Actually, due to state batching, the function form `setItems(prev => ...)` is used.
    // It processes 1 (array is [1]), then 2 (array is [2, 1]), then 3 (array is [3, 2, 1]).
    // Sliced to 2, it becomes [3, 2].
    expect(result.current?.items).toEqual([{ id: 3 }, { id: 2 }]);
  });

  it('kills process and stops on unmount', async () => {
    const { result, unmount } = renderHook(() => useStream('cmd'));
    
    await act(async () => {
      result.current?.start();
      await flushPromises();
    });
    
    expect(result.current?.isStreaming).toBe(true);
    
    await act(async () => {
      unmount();
      await flushPromises();
    });
    
    expect(mockProcess.kill).toHaveBeenCalled();
  });

  describe('when IS_MOCK is true', () => {
    beforeEach(() => {
      (global as any).__MOCK_IS_MOCK = true;
      vi.useFakeTimers();
    });

    it('uses mock data with interval instead of spawning process', async () => {
      vi.mocked(mockModule.getMockData).mockReturnValue([{ mockId: 99 }] as any);

      const { result } = renderHook(() => useStream('cmd', ['--arg']));
      
      await act(async () => {
        result.current?.start();
      });

      expect(nansenModule.spawnNansenStream).not.toHaveBeenCalled();
      expect(result.current?.isStreaming).toBe(true);

      // Fast-forward by 2000ms async to resolve promises
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(mockModule.getMockData).toHaveBeenCalledWith('cmd', ['--arg']);
      expect(result.current?.items).toEqual([{ mockId: 99 }]);

      // Stop it
      await act(async () => {
        result.current?.stop();
      });
      expect(result.current?.isStreaming).toBe(false);

      // Advance again and ensure no more items
      vi.mocked(mockModule.getMockData).mockClear();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      expect(mockModule.getMockData).not.toHaveBeenCalled();
    });

    it('does nothing if mock data is not an array', async () => {
      vi.mocked(mockModule.getMockData).mockReturnValue({ notArray: true } as any);

      const { result } = renderHook(() => useStream('cmd'));
      
      await act(async () => {
        result.current?.start();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current?.items).toEqual([]);
    });

    it('does nothing if mock data array is empty', async () => {
      vi.mocked(mockModule.getMockData).mockReturnValue([] as any);

      const { result } = renderHook(() => useStream('cmd'));
      
      await act(async () => {
        result.current?.start();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });

      expect(result.current?.items).toEqual([]);
    });

    it('stops mocking on unmount', async () => {
      const spy = vi.spyOn(global, 'clearInterval');
      const { result, unmount } = renderHook(() => useStream('cmd'));
      
      await act(async () => {
        result.current?.start();
      });
      
      await act(async () => {
        unmount();
      });
      
      expect(spy).toHaveBeenCalled();
      vi.advanceTimersByTime(2000);
    });
  });
});
