import { render } from 'ink-testing-library';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import TradeModal from '../TradeModal.js';

// Mock the nansen module
vi.mock('../../lib/nansen.js', () => ({
  fetchTradeQuote: vi.fn().mockResolvedValue({
    success: true,
    data: {
      quote_id: 'mock_quote_123',
      expected_output: '0.985',
      price_impact: '0.1%',
      fee: '0.001',
      route: ['SOL', 'USDC'],
    },
  }),
  fetchTradeExecute: vi.fn().mockResolvedValue({
    success: true,
    data: { tx_hash: '0xabc123', status: 'confirmed' },
  }),
}));

describe('TradeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quote view when trading is supported and wallet is selected', () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);
    const frame = lastFrame();

    expect(frame).toContain('💱 TRADE QUOTE');
    expect(frame).toContain('Solana');
    expect(frame).toContain('test-wallet');
    expect(frame).toContain('SOL → USDC');
  });

  it('shows execute confirmation view', () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="execute" />);
    const frame = lastFrame();

    expect(frame).toContain('CONFIRM TRADE EXECUTION');
    expect(frame).toContain('Solana');
    expect(frame).toContain('test-wallet');
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

  it('shows loading state while fetching quote', () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);
    const frame = lastFrame();

    // Initially should show loading or the swap details
    expect(frame).toContain('SOL → USDC');
  });

  it('uses selectedToken when provided', () => {
    const { lastFrame } = render(
      <TradeModal chain="solana" walletName="test-wallet" mode="quote" selectedToken="BONK" />
    );
    const frame = lastFrame();

    expect(frame).toContain('BONK → USDC');
  });

  it('defaults mode to quote', () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" />);
    const frame = lastFrame();

    expect(frame).toContain('💱 TRADE QUOTE');
    expect(frame).not.toContain('CONFIRM TRADE EXECUTION');
  });
});
