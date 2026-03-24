import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import { Text } from 'ink';
import SizeGuard from '../SizeGuard.js';

// Mock ink's useStdout
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink');
  return {
    ...actual,
    useStdout: vi.fn(),
  };
});

import { useStdout } from 'ink';
const mockedUseStdout = vi.mocked(useStdout);

describe('SizeGuard', () => {
  it('renders children when terminal is large enough', () => {
    mockedUseStdout.mockReturnValue({
      stdout: { columns: 120, rows: 24 } as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>App Content</Text>
      </SizeGuard>
    );

    expect(lastFrame()).toContain('App Content');
    expect(lastFrame()).not.toContain('Terminal too small');
  });

  it('shows warning when terminal is too narrow', () => {
    mockedUseStdout.mockReturnValue({
      stdout: { columns: 80, rows: 30 } as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>App Content</Text>
      </SizeGuard>
    );

    expect(lastFrame()).toContain('Terminal too small');
    expect(lastFrame()).toContain('120×24');
    expect(lastFrame()).toContain('80×30');
    expect(lastFrame()).not.toContain('App Content');
  });

  it('shows warning when terminal is too short', () => {
    mockedUseStdout.mockReturnValue({
      stdout: { columns: 150, rows: 20 } as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>App Content</Text>
      </SizeGuard>
    );

    expect(lastFrame()).toContain('Terminal too small');
    expect(lastFrame()).toContain('150×20');
    expect(lastFrame()).not.toContain('App Content');
  });

  it('shows warning when both dimensions are too small', () => {
    mockedUseStdout.mockReturnValue({
      stdout: { columns: 50, rows: 10 } as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>App Content</Text>
      </SizeGuard>
    );

    expect(lastFrame()).toContain('Terminal too small');
    expect(lastFrame()).toContain('50×10');
  });

  it('handles null stdout gracefully', () => {
    mockedUseStdout.mockReturnValue({
      stdout: null as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>App Content</Text>
      </SizeGuard>
    );

    // With null stdout, columns=0, rows=0 → too small
    expect(lastFrame()).toContain('Terminal too small');
    expect(lastFrame()).toContain('0×0');
  });

  it('renders children at exact minimum size boundary', () => {
    mockedUseStdout.mockReturnValue({
      stdout: { columns: 120, rows: 24 } as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>Boundary Content</Text>
      </SizeGuard>
    );

    expect(lastFrame()).toContain('Boundary Content');
    expect(lastFrame()).not.toContain('Terminal too small');
  });

  it('contains resize instruction text', () => {
    mockedUseStdout.mockReturnValue({
      stdout: { columns: 50, rows: 10 } as any,
      write: vi.fn(),
    });

    const { lastFrame } = render(
      <SizeGuard>
        <Text>App Content</Text>
      </SizeGuard>
    );

    expect(lastFrame()).toContain('Resize your terminal');
  });
});
