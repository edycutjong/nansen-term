import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import StatusBar from '../StatusBar.js';

describe('StatusBar', () => {
  const baseProps = {
    apiCallCount: 5,
    lastRefresh: new Date('2024-01-01T12:00:00Z'),
    isStreaming: false,
  };

  it('renders default state correctly', () => {
    const { lastFrame } = render(<StatusBar {...baseProps} />);
    const frame = lastFrame();

    expect(frame).toContain('✓ Connected');
    expect(frame).toContain('5 API calls');
    expect(frame).toContain('Last refresh:'); // time string can vary by timezone, check presence
  });

  it('renders error state correctly', () => {
    const { lastFrame } = render(<StatusBar {...baseProps} error="API Rate Limit" />);
    const frame = lastFrame();

    expect(frame).toContain('✗ API Rate Limit');
    expect(frame).not.toContain('✓ Connected');
  });

  it('renders streaming state correctly', () => {
    const { lastFrame } = render(<StatusBar {...baseProps} isStreaming={true} />);
    const frame = lastFrame();

    expect(frame).toContain('● STREAMING');
  });

  it('renders when lastRefresh is null', () => {
    const { lastFrame } = render(<StatusBar {...baseProps} lastRefresh={null} />);
    const frame = lastFrame();

    expect(frame).toContain('Last refresh: —');
  });

  describe('notifications', () => {
    it('renders info notification', () => {
      const { lastFrame } = render(
        <StatusBar {...baseProps} notification={{ message: 'Data updated', type: 'info' }} />
      );
      expect(lastFrame()).toContain('Data updated');
    });

    it('renders warn notification', () => {
      const { lastFrame } = render(
        <StatusBar {...baseProps} notification={{ message: 'High latency', type: 'warn' }} />
      );
      expect(lastFrame()).toContain('High latency');
    });

    it('renders error notification', () => {
      const { lastFrame } = render(
        <StatusBar {...baseProps} notification={{ message: 'Connection lost', type: 'error' }} />
      );
      expect(lastFrame()).toContain('Connection lost');
    });
  });

  it('renders singular "API call" when count is 1', () => {
    const { lastFrame } = render(
      <StatusBar {...baseProps} apiCallCount={1} />
    );
    const frame = lastFrame();
    expect(frame).toContain('1 API call');
    expect(frame).not.toContain('1 API calls');
  });

  it('updates count from polling interval', async () => {
    // Mock getApiCallCount to return a higher value
    const nansenModule = await import('../../lib/nansen.js');
    const getApiCallCountSpy = vi.spyOn(nansenModule, 'getApiCallCount').mockReturnValue(42);

    vi.useFakeTimers();

    const { lastFrame, unmount } = render(
      <StatusBar {...baseProps} apiCallCount={5} />
    );

    // Initially shows 5
    expect(lastFrame()).toContain('5 API calls');

    // Advance timer by 1 second to trigger the interval
    await vi.advanceTimersByTimeAsync(1000);

    // Now should show 42 from the polled value
    expect(lastFrame()).toContain('42 API calls');

    unmount();
    getApiCallCountSpy.mockRestore();
    vi.useRealTimers();
  });

  it('does not update count when polled value is 0', async () => {
    const nansenModule = await import('../../lib/nansen.js');
    const getApiCallCountSpy = vi.spyOn(nansenModule, 'getApiCallCount').mockReturnValue(0);

    vi.useFakeTimers();

    const { lastFrame, unmount } = render(
      <StatusBar {...baseProps} apiCallCount={5} />
    );

    expect(lastFrame()).toContain('5 API calls');

    await vi.advanceTimersByTimeAsync(1000);

    // Count should stay 5 since polled value is 0
    expect(lastFrame()).toContain('5 API calls');

    unmount();
    getApiCallCountSpy.mockRestore();
    vi.useRealTimers();
  });

  it('cleans up polling interval on unmount', async () => {
    const nansenModule = await import('../../lib/nansen.js');
    const getApiCallCountSpy = vi.spyOn(nansenModule, 'getApiCallCount').mockReturnValue(10);

    vi.useFakeTimers();

    const { unmount, lastFrame } = render(
      <StatusBar {...baseProps} apiCallCount={5} />
    );

    expect(lastFrame()).toContain('5 API calls');

    // Unmount triggers clearInterval cleanup
    unmount();

    // Advancing timer after unmount should not cause errors
    await vi.advanceTimersByTimeAsync(2000);

    getApiCallCountSpy.mockRestore();
    vi.useRealTimers();
  });
});
