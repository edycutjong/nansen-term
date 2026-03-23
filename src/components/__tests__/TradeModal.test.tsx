import { render } from 'ink-testing-library';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import TradeModal from '../TradeModal.js';

const defaultQuoteData = {
  success: true,
  data: {
    quote_id: 'mock_quote_123',
    expected_output: '0.985',
    price_impact: '0.1%',
    fee: '0.001',
    route: ['SOL', 'USDC'],
  },
};

const mockFetchTradeQuote = vi.fn();
const mockFetchTradeExecute = vi.fn();

vi.mock('../../lib/nansen.js', () => ({
  fetchTradeQuote: (...args: unknown[]) => mockFetchTradeQuote(...args),
  fetchTradeExecute: (...args: unknown[]) => mockFetchTradeExecute(...args),
}));

describe('TradeModal', () => {
  beforeEach(() => {
    mockFetchTradeQuote.mockReset().mockResolvedValue(defaultQuoteData);
    mockFetchTradeExecute.mockReset().mockResolvedValue({
      success: true,
      data: { tx_hash: '0xabc123', status: 'confirmed' },
    });
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

  it('displays quote data after successful fetch', async () => {
    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);

    // Wait for the promise to resolve
    await new Promise((r) => setTimeout(r, 50));

    const frame = lastFrame();
    expect(frame).toContain('0.985');
    expect(frame).toContain('0.1%');
  });

  it('displays error when quote fetch fails', async () => {
    mockFetchTradeQuote.mockResolvedValueOnce({
      success: false,
      error: 'Insufficient liquidity',
    });

    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);

    await new Promise((r) => setTimeout(r, 50));

    const frame = lastFrame();
    expect(frame).toContain('Insufficient liquidity');
  });

  it('displays error when quote fetch throws', async () => {
    mockFetchTradeQuote.mockRejectedValueOnce(new Error('Network timeout'));

    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);

    await new Promise((r) => setTimeout(r, 50));

    const frame = lastFrame();
    expect(frame).toContain('Network timeout');
  });

  it('displays default error message when result has no error string', async () => {
    mockFetchTradeQuote.mockResolvedValueOnce({
      success: false,
    });

    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);

    await new Promise((r) => setTimeout(r, 50));

    const frame = lastFrame();
    expect(frame).toContain('Failed to get quote');
  });

  it('renders on base chain (another supported chain)', () => {
    const { lastFrame } = render(<TradeModal chain="base" walletName="test-wallet" mode="quote" />);
    const frame = lastFrame();

    expect(frame).toContain('💱 TRADE QUOTE');
    expect(frame).toContain('Base');
  });

  it('shows to_amount fallback when expected_output is missing', async () => {
    mockFetchTradeQuote.mockResolvedValue({
      success: true,
      data: {
        to_amount: '2.5',
        price_impact: '-0.5%',
        route: ['SOL', 'USDT', 'USDC'],
      },
    });

    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);
    await new Promise((r) => setTimeout(r, 100));

    const frame = lastFrame();
    expect(frame).toContain('2.5');
    expect(frame).toContain('-0.5%');
    expect(frame).toContain('SOL → USDT → USDC');
  });

  it('shows dash when no fee and no expected_output', async () => {
    mockFetchTradeQuote.mockResolvedValueOnce({
      success: true,
      data: {
        price_impact: '0.2%',
      },
    });

    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);
    await new Promise((r) => setTimeout(r, 50));

    const frame = lastFrame();
    expect(frame).toContain('—'); // fallback for missing fields
  });

  it('shows dash for missing price_impact', async () => {
    mockFetchTradeQuote.mockResolvedValueOnce({
      success: true,
      data: {
        expected_output: '1.0',
        fee: '0.01',
      },
    });

    const { lastFrame } = render(<TradeModal chain="solana" walletName="test-wallet" mode="quote" />);
    await new Promise((r) => setTimeout(r, 50));

    const frame = lastFrame();
    expect(frame).toContain('1.0'); // expected_output
    expect(frame).toContain('Price Impact');
  });
});
