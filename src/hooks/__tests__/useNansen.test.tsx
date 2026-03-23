
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'ink-testing-library';
import { useNansen } from '../useNansen.js';
import { Text } from 'ink';
import * as nansenModule from '../../lib/nansen.js';

vi.mock('../../lib/nansen.js', () => ({
  execNansen: vi.fn(),
  spawnNansenStream: vi.fn(),
}));

// We need a helper to extract hook results because we're not using @testing-library/react
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

describe('useNansen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const flushPromises = () => new Promise(resolve => setImmediate(resolve));

  it('initially loads and autoFetches successfully', async () => {
    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: true,
      data: { value: 42 },
    });

    const { result } = renderHook(() => useNansen('cmd', ['--flag'], true));
    
    // Initial state
    expect(result.current?.loading).toBe(true);
    expect(result.current?.data).toBeNull();
    expect(result.current?.error).toBeNull();

    await flushPromises();

    // Final state
    expect(result.current?.loading).toBe(false);
    expect(result.current?.data).toEqual({ value: 42 });
    expect(result.current?.error).toBeNull();
    expect(nansenModule.execNansen).toHaveBeenCalledWith('cmd', ['--flag']);
  });

  it('uses default parameters when only command is provided', async () => {
    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: true,
      data: { default: true },
    });

    const { result } = renderHook(() => useNansen('cmd'));
    await flushPromises();

    expect(result.current?.data).toEqual({ default: true });
    expect(nansenModule.execNansen).toHaveBeenCalledWith('cmd', []);
  });

  it('handles execution error correctly', async () => {
    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: false,
      error: 'Command failed',
    });

    const { result } = renderHook(() => useNansen('cmd', [], true));
    
    await flushPromises();

    expect(result.current?.loading).toBe(false);
    expect(result.current?.data).toBeNull();
    expect(result.current?.error).toBe('Command failed');
  });

  it('handles thrown error correctly', async () => {
    vi.mocked(nansenModule.execNansen).mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useNansen('cmd', [], true));
    
    await flushPromises();

    expect(result.current?.loading).toBe(false);
    expect(result.current?.data).toBeNull();
    expect(result.current?.error).toBe('Network failure');
  });

  it('handles non-Error thrown gracefully', async () => {
    vi.mocked(nansenModule.execNansen).mockRejectedValueOnce('Some string error');

    const { result } = renderHook(() => useNansen('cmd', [], true));
    
    await flushPromises();

    expect(result.current?.error).toBe('Failed to execute command');
  });

  it('handles missing error message from execNansen gracefully', async () => {
    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: false,
      // error undefined
    });

    const { result } = renderHook(() => useNansen('cmd', [], true));
    
    await flushPromises();

    expect(result.current?.error).toBe('Unknown error');
  });

  it('does not autoFetch if autoFetch is false', async () => {
    const { result } = renderHook(() => useNansen('cmd', [], false));
    
    expect(result.current?.loading).toBe(false);
    expect(nansenModule.execNansen).not.toHaveBeenCalled();

    // Let's test the refresh function manually calling it
    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: true,
      data: 'refreshed data',
    });

    // We can directly call refresh from the current result
    // Note: since this is an async React update, we have to act, but we don't have act()
    // We will just call the function and await flushPromises()
    result.current?.refresh();
    
    expect(result.current?.loading).toBe(true);

    await flushPromises();

    expect(result.current?.loading).toBe(false);
    expect(result.current?.data).toBe('refreshed data');
  });

  it('refetches when trigger increases', async () => {
    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: true,
      data: 'initial',
    });

    let triggerVal = 0;
    const { result, rerender } = renderHook(() => useNansen('cmd', [], true, triggerVal));
    
    await flushPromises();
    expect(result.current?.data).toBe('initial');
    expect(nansenModule.execNansen).toHaveBeenCalledTimes(1);

    vi.mocked(nansenModule.execNansen).mockResolvedValueOnce({
      success: true,
      data: 'triggered',
    });

    // Update trigger and rerender
    triggerVal = 1;
    rerender();
    
    await flushPromises();
    expect(nansenModule.execNansen).toHaveBeenCalledTimes(2);
    expect(result.current?.data).toBe('triggered');
  });
});
