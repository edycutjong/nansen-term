import { render } from 'ink-testing-library';
import { describe, expect, it } from 'vitest';
import TradeModal from '../TradeModal.js';

describe('TradeModal', () => {
  it('renders correctly when trading is supported and wallet is selected', () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" />);
    const frame = lastFrame();

    expect(frame).toContain('💱 TRADE QUOTE');
    expect(frame).toContain('Solana');
    expect(frame).toContain('test-wallet');
    expect(frame).toContain('nansen trade quote --chain solana');
    expect(frame).toContain('nansen trade execute --chain solana');
  });

  it('shows error if chain does not support trading', () => {
    const { lastFrame } = render(<TradeModal chain="ethereum" walletName="test-wallet" />);
    const frame = lastFrame();

    expect(frame).toContain('Trading only supported on Solana and Base.');
    expect(frame).not.toContain('💱 TRADE QUOTE');
  });

  it('shows error if no wallet is selected', () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName={null} />);
    const frame = lastFrame();

    expect(frame).toContain('No wallet selected.');
    expect(frame).not.toContain('💱 TRADE QUOTE');
  });
});
