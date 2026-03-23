import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import Header from '../Header.js';

describe('Header', () => {
  it('renders basic info correctly', () => {
    const { lastFrame } = render(<Header chain="ethereum" walletName={null} />);
    const frame = lastFrame();

    expect(frame).toContain('NansenTerm');
    expect(frame).toContain('v1.0.0'); // default version
    expect(frame).toContain('Ethereum'); // from meta
    expect(frame).toContain('none'); // no wallet
  });

  it('renders wallet name correctly', () => {
    const { lastFrame } = render(<Header chain="arbitrum" walletName="my-wallet" />);
    const frame = lastFrame();

    expect(frame).toContain('Arbitrum');
    expect(frame).toContain('my-wallet');
  });

  describe('modes', () => {
    it('renders home mode shortcuts without wallet', () => {
      const { lastFrame } = render(<Header chain="ethereum" walletName={null} mode="home" />);
      const frame = lastFrame();

      expect(frame).toContain('[Tab/←→] Switch Pane');
      expect(frame).toContain('[C] Chain');
      expect(frame).toContain('[Q] Quote');
      expect(frame).not.toContain('[T] Trade');
    });

    it('renders home mode shortcuts with wallet', () => {
      const { lastFrame } = render(<Header chain="ethereum" walletName="test" mode="home" />);
      const frame = lastFrame();

      expect(frame).toContain('[T] Trade');
    });

    it('renders trade mode shortcuts', () => {
      const { lastFrame } = render(<Header chain="ethereum" walletName={null} mode="trade" />);
      const frame = lastFrame();

      expect(frame).toContain('[C] Chain');
      expect(frame).toContain('[Esc] Close');
      expect(frame).not.toContain('[Q] Quote');
    });

    it('renders help mode shortcuts without wallet', () => {
      const { lastFrame } = render(<Header chain="ethereum" walletName={null} mode="help" />);
      const frame = lastFrame();

      expect(frame).toContain('[Q] Quote');
      expect(frame).toContain('[C] Chain');
      expect(frame).toContain('[Esc] Close');
      expect(frame).not.toContain('[T] Trade');
    });

    it('renders help mode shortcuts with wallet', () => {
      const { lastFrame } = render(<Header chain="ethereum" walletName="test" mode="help" />);
      const frame = lastFrame();

      expect(frame).toContain('[T] Trade');
    });
  });
});
