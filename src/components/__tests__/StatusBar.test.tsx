import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
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
});
