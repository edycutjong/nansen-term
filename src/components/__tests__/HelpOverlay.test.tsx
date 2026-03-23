import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import HelpOverlay from '../HelpOverlay.js';

describe('HelpOverlay', () => {
  it('renders correctly', () => {
    const { lastFrame } = render(<HelpOverlay />);
    const frame = lastFrame();

    expect(frame).toContain('⌨ KEYBOARD SHORTCUTS');
    expect(frame).toContain('Tab / Shift+Tab');
    expect(frame).toContain('Cycle through panes');
  });
});
