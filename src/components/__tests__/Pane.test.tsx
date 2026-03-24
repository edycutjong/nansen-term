import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import { Text } from 'ink';
import Pane from '../Pane.js';

describe('Pane', () => {
  it('renders correctly with title and children', () => {
    const { lastFrame } = render(
      <Pane title="Test Pane">
        <Text>Pane Content</Text>
      </Pane>
    );

    const frame = lastFrame();
    expect(frame).toContain('TEST PANE');
    expect(frame).toContain('Pane Content');
  });

  it('renders emoji if provided', () => {
    const { lastFrame } = render(
      <Pane title="Test Pane" emoji="🚀">
        <Text>Content</Text>
      </Pane>
    );

    const frame = lastFrame();
    expect(frame).toContain('🚀 TEST PANE');
  });

  it('renders active state correctly', () => {
    const { lastFrame } = render(
      <Pane title="Active Pane" isActive>
        <Text>Content</Text>
      </Pane>
    );

    const frame = lastFrame();
    expect(frame).toContain('ACTIVE PANE');
    expect(frame).toContain('<');
  });
});
