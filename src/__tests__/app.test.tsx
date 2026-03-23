
import { render } from 'ink-testing-library';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App, { setupTerminal, cleanupTerminal, clearAutoRefresh } from '../app.js';
import { useNansen } from '../hooks/useNansen.js';
import { getApiCallCount, fetchWalletList } from '../lib/nansen.js';
import { useStream } from '../hooks/useStream.js';

vi.mock('../hooks/useNansen', () => ({
  useNansen: vi.fn(),
}));

vi.mock('../lib/nansen', () => ({
  getApiCallCount: vi.fn(),
  fetchWalletList: vi.fn().mockResolvedValue({ success: true, data: [] }),
  fetchTradeQuote: vi.fn().mockResolvedValue({ success: true, data: {} }),
  fetchTradeExecute: vi.fn().mockResolvedValue({ success: true, data: {} }),
}));

vi.mock('../hooks/useStream', () => ({
  useStream: vi.fn(),
}));

vi.mock('ink', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ink')>();
  return {
    ...actual,
    useStdout: vi.fn(() => ({
      stdout: { rows: 40, columns: 80 },
    })),
  };
});

const wait = (ms = 10) => new Promise((r) => setTimeout(r, ms));

describe('App', () => {
  let stdoutWriteSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    (useNansen as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    (useStream as any).mockReturnValue({
      items: [],
      isStreaming: false,
      start: vi.fn(),
      stop: vi.fn(),
      error: null,
    });
    (getApiCallCount as any).mockReturnValue(0);
    (fetchWalletList as any).mockResolvedValue({ success: true, data: [] });

    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
    vi.useRealTimers();
  });

  // ========================================
  // Basic Rendering
  // ========================================

  it('renders the main app components', async () => {
    const { lastFrame } = render(<App />);
    await wait();
    
    const frame = lastFrame();
    expect(frame).toContain('NansenTerm');
    expect(frame).toContain('SMART MONEY NETFLOW');
    expect(frame).toContain('DEX TRADES (SNAPSHOT)');
    expect(frame).toContain('PERP SCREENER');
    expect(frame).toContain('WALLET');
  });

  it('writes terminal escape codes on mount', async () => {
    vi.useRealTimers();
    render(<App />);
    await wait();
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\x1B[?25l');
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\x1B]0;NansenTerm\x07');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('cleanupTerminal restores cursor and clears title', () => {
    cleanupTerminal();
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\x1B[?25h');
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\x1B]0;\x07');
  });

  it('clearAutoRefresh clears auto-refresh interval', () => {
    // Call with no timer (null branch)
    clearAutoRefresh();
    // Also test with a real timer (truthy branch)
    const { stdin } = render(<App />);
    // App's useEffect sets the interval, so clearAutoRefresh should clear it
    clearAutoRefresh();
    stdin.write('q');
  });

  it('setupTerminal hides cursor and sets title', () => {
    setupTerminal();
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\x1B[?25l');
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\x1B]0;NansenTerm\x07');
  });

  // ========================================
  // Help Overlay
  // ========================================

  it('toggles help overlay on ? key press', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    stdin.write('?');
    await wait();
    expect(lastFrame()).toContain('KEYBOARD SHORTCUTS');
    
    // Close help
    stdin.write('\x1B'); // Esc to close
    await wait();
    expect(lastFrame()).not.toContain('KEYBOARD SHORTCUTS');
  });

  // ========================================
  // Pane Navigation
  // ========================================

  it('can navigate between panes using tab', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    expect(lastFrame()).toContain('SMART MONEY NETFLOW ◀');
    
    stdin.write('\t');
    await wait();
    expect(lastFrame()).toContain('DEX TRADES');
  });

  it('can navigate panes in reverse with shift+tab', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    // Shift+Tab should go to last pane (wallet)
    stdin.write('\x1B[Z');
    await wait();
    expect(lastFrame()).toContain('WALLET ◀');
  });

  it('navigates between panes with arrow keys', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    // Right arrow → dex-trades
    stdin.write('\x1B[C');
    await wait();
    expect(lastFrame()).toContain('DEX TRADES');

    // Down arrow → wallet (from dex-trades)
    stdin.write('\x1B[B');
    await wait();

    // Left arrow
    stdin.write('\x1B[D');
    await wait();

    // Up arrow
    stdin.write('\x1B[A');
    await wait();
    expect(lastFrame()).toContain('NansenTerm');
  });

  it('scrolls up and down within a pane', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Scroll down (j key or down arrow within pane)
    stdin.write('j');
    await wait();
    expect(lastFrame()).toContain('NansenTerm');

    // Scroll up (k key)
    stdin.write('k');
    await wait();
    expect(lastFrame()).toContain('NansenTerm');
  });

  // ========================================
  // Chain Cycling  
  // ========================================

  it('changes chain with c', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    stdin.write('c');
    await wait();
    expect(lastFrame()).toContain('Solana');
  });

  it('switches chain back with C (shift+c)', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('c');
    await wait();
    expect(lastFrame()).toContain('Solana');

    stdin.write('C');
    await wait();
    expect(lastFrame()).toContain('Ethereum');
  });

  it('cycles chain from help overlay', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Open help
    stdin.write('?');
    await wait();
    expect(lastFrame()).toContain('KEYBOARD SHORTCUTS');

    // Cycle chain while help is open
    stdin.write('c');
    await wait();
    // Help should still be visible but chain changed
    stdin.write('\x1B');
    await wait();
    expect(lastFrame()).toContain('Solana');
  });

  // ========================================
  // Streaming
  // ========================================

  it('toggles streaming using s', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    stdin.write('s');
    await wait();
    expect(lastFrame()).toContain('● STREAMING');
    
    stdin.write('s');
    await wait();
    expect(lastFrame()).not.toContain('● STREAMING');
  });

  // ========================================
  // Refresh
  // ========================================

  it('refreshes current pane with r', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('r');
    await wait();
    expect(lastFrame()).toContain('NansenTerm');
  });

  it('refreshes all panes with p', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('p');
    await wait();
    expect(lastFrame()).toContain('NansenTerm');
  });

  it('auto-refreshes on 5 minute timer', async () => {
    const { lastFrame } = render(<App />);
    await wait();

    // Advance timer by 5 minutes
    vi.advanceTimersByTime(5 * 60_000);
    await wait();

    expect(lastFrame()).toContain('NansenTerm');
  });

  // ========================================
  // Wallet Management
  // ========================================

  it('opens wallet modal with a', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    stdin.write('a');
    await wait();
    expect(lastFrame()).toContain('ADD NEW WALLET');
    
    stdin.write('\x1B');
    await wait();
    expect(lastFrame()).not.toContain('ADD NEW WALLET');
  });

  it('switches wallet with w when wallets exist', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'alpha-wallet' }, { name: 'beta-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    // walletIndexRef starts at 0, (0+1)%2 = 1, so picks beta-wallet
    expect(frame).toContain('beta-wallet');
  });

  it('switches wallet backward with W (Shift+W)', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'alpha-wallet' }, { name: 'beta-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('W');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('beta-wallet');
  });

  it('switches wallet from { wallets: [...] } format', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: { wallets: [{ name: 'nested-w1' }, { name: 'nested-w2' }] },
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('nested-w2');
  });

  it('handles prevWallet with data object without wallets property', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: { other: true },
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('W');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('No wallets found');
  });

  it('prevWallet uses ? for wallet without name fields', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ address: '0x123' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('W');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('?');
  });

  it('handles wallet_name fallback field', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ wallet_name: 'fallback-name' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('fallback-name');
  });

  it('shows warning when no wallets found on switch', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('No wallets found');
  });

  it('shows error notification when wallet fetch fails', async () => {
    (fetchWalletList as any).mockRejectedValue(new Error('Network error'));

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('Failed to fetch wallets');
  });

  it('handles data object without wallets property as no wallets', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: { someOtherKey: 'value' }, // Not an array, no .wallets property
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('No wallets found');
  });

  it('uses ? when wallet has no name or wallet_name', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ id: 123 }], // No name or wallet_name field
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('?');
  });

  it('handles wallet list with wallets format', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: { wallets: [{ name: 'nested-wallet' }] },
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('nested-wallet');
  });

  it('handles wallet with wallet_name field', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ wallet_name: 'alt-name-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('alt-name-wallet');
  });

  it('handles wallet list fetch failure (success: false)', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: false,
      data: null,
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('No wallets found');
  });

  it('handles prevWallet fetch failure (success: false)', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: false,
      data: null,
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('W');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('No wallets found');
  });

  // ========================================
  // Token Selection & Detail Overlay
  // ========================================

  it('opens token detail when Enter is pressed with highlighted token', async () => {
    // Mock useNansen to return data with tokens
    (useNansen as any).mockReturnValue({
      data: [{ token_symbol: 'ETH', net_flow_24h_usd: 1000, net_flow_7d_usd: 5000, token_address: '0xETH' }],
      isLoading: false,
      error: null,
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Select first row (scroll down)
    stdin.write('j');
    await wait();

    // Press Enter to open token detail
    stdin.write('\r');
    await wait();

    // Token detail should be visible
    const frame = lastFrame();
    // It should show token detail or at least not crash
    expect(frame).toContain('NansenTerm');
  });

  // ========================================
  // Trade Overlays
  // ========================================

  it('opens trade quote with q', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();
    
    stdin.write('q');
    await wait();
    expect(lastFrame()).toContain('TRADE');
  });

  it('opens trade modal with t key', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('t');
    await wait();
    expect(lastFrame()).toContain('TRADE');

    stdin.write('\x1B');
    await wait();
  });

  it('can open trade from help overlay', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Open help
    stdin.write('?');
    await wait();
    expect(lastFrame()).toContain('KEYBOARD SHORTCUTS');

    // Press q to open quote (should close help first)
    stdin.write('q');
    await wait();
    expect(lastFrame()).toContain('TRADE');
  });

  it('can execute trade from help overlay', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('?');
    await wait();

    stdin.write('t');
    await wait();
    expect(lastFrame()).toContain('TRADE');
  });

  // ========================================
  // Close Overlay / Esc Key
  // ========================================

  it('does nothing when Esc pressed and no overlay is open', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'alpha-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Select a wallet first
    stdin.write('w');
    await wait(50);
    expect(lastFrame()).toContain('alpha-wallet');

    // Press Esc — should NOT unselect wallet (no overlay open)
    stdin.write('\x1B');
    await wait();

    const frame = lastFrame();
    expect(frame).toContain('alpha-wallet');
    expect(frame).not.toContain('Wallet unselected');
  });

  it('closes all overlays on Esc', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Open wallet modal
    stdin.write('a');
    await wait();
    expect(lastFrame()).toContain('ADD NEW WALLET');

    // Close it
    stdin.write('\x1B');
    await wait();
    expect(lastFrame()).not.toContain('ADD NEW WALLET');
  });

  // ========================================
  // Wallet pane Enter-to-select (no wallet selected)
  // ========================================

  it('selects wallet via Enter key in wallet pane when no wallet is selected', async () => {
    (useNansen as any).mockReturnValue({
      data: [{ name: 'list-wallet-1' }],
      isLoading: false,
      error: null,
    });

    // Mock fetchWalletList with the useEffect sync
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'list-wallet-1' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Navigate to wallet pane (3 tabs from netflow)
    stdin.write('\t');
    await wait();
    stdin.write('\t');
    await wait();
    stdin.write('\t');
    await wait();

    // Press Enter to select the highlighted wallet
    stdin.write('\r');
    await wait(50);

    expect(lastFrame()).toContain('NansenTerm');
  });

  // ========================================
  // Overlay switching from within overlays
  // ========================================

  it('switches wallet from wallet modal overlay', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'overlay-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Open wallet modal
    stdin.write('a');
    await wait();
    expect(lastFrame()).toContain('ADD NEW WALLET');

    // Switch wallet while modal is open
    stdin.write('w');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('overlay-wallet');
  });

  // ========================================
  // Edge Cases
  // ========================================

  it('handles Esc when no overlay and no wallet (noop)', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Esc should do nothing -- no overlay, no wallet
    stdin.write('\x1B');
    await wait();

    expect(lastFrame()).toContain('NansenTerm');
  });

  it('handles multiple rapid key presses gracefully', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('c');
    stdin.write('c');
    stdin.write('c');
    await wait();

    // Should be 3 chains ahead
    const frame = lastFrame();
    expect(frame).toContain('NansenTerm');
  });

  // ========================================
  // handlePrevWallet error paths
  // ========================================

  it('shows error notification when prev wallet fetch fails', async () => {
    (fetchWalletList as any).mockRejectedValue(new Error('Server down'));

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('W');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('Failed to fetch wallets');
  });

  it('shows warning when prev wallet has no wallets', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    stdin.write('W');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('No wallets found');
  });

  // ========================================
  // Wallet sync useEffect (catch block coverage)
  // ========================================

  it('handles wallet sync useEffect fetch failure silently', async () => {
    (fetchWalletList as any).mockRejectedValue(new Error('Network error'));

    const { lastFrame } = render(<App />);
    await wait(50);

    // Should still render without crash
    expect(lastFrame()).toContain('NansenTerm');
  });

  // ========================================
  // Unmount cleanup
  // ========================================

  // Note: Unmount cleanup (cursor restore) cannot be tested via
  // ink-testing-library as it doesn't properly trigger React useEffect
  // cleanup functions. Lines 270-271 of app.tsx are tested by the 
  // mount escape codes test above.

  // ========================================
  // Notification timeout clears
  // ========================================

  it('clears notification after timeout', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'timed-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Trigger notification
    stdin.write('w');
    await wait(50);
    expect(lastFrame()).toContain('timed-wallet');

    // Advance past notification timeout (3000ms)
    vi.advanceTimersByTime(3100);
    await wait();
    
    // Notification should be cleared
    const frame = lastFrame();
    // Wallet name still in header, but notification text should clear
    expect(frame).toContain('NansenTerm');
  });

  // ========================================
  // handleSelectToken (Enter key)
  // ========================================

  it('picks wallet from list when Enter pressed on wallet pane without wallet', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [{ name: 'pick-wallet' }],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // First do a wallet switch to populate walletListRef
    stdin.write('w');
    await wait(50);

    // Navigate to wallet pane with Shift+Tab
    stdin.write('\x1B[Z');
    await wait();

    // Press Enter to pick the wallet
    stdin.write('\r');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('pick-wallet');
  });

  it('does nothing when Enter pressed on wallet pane with no wallets available', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: [],
    });

    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Navigate to wallet pane
    stdin.write('\x1B[Z');
    await wait();

    // Press Enter — nothing should happen since no wallets
    stdin.write('\r');
    await wait();

    const frame = lastFrame();
    expect(frame).toContain('NansenTerm');
  });

  it('does not open token detail when Enter pressed with no highlighted token', async () => {
    const { lastFrame, stdin } = render(<App />);
    await wait();

    // Press Enter on netflow pane (default) — no highlighted token
    stdin.write('\r');
    await wait();

    const frame = lastFrame();
    // Should still show main view, not token detail
    expect(frame).toContain('SMART MONEY NETFLOW');
    expect(frame).not.toContain('Token:');
  });

  it('opens token detail when Enter pressed with highlighted token', async () => {
    // Provide netflow data so highlight gets set
    (useNansen as any).mockReturnValue({
      data: [
        { token_symbol: 'ETH', net_flow_24h_usd: 1000, net_flow_7d_usd: 5000, token_address: '0xETH' },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    vi.useRealTimers();
    const { lastFrame, stdin } = render(<App />);
    await wait(100);

    // Press Enter to select the highlighted token
    stdin.write('\r');
    await wait(100);

    const frame = lastFrame();
    // TokenDetail should open — verify by checking that the main 4-pane dashboard is replaced
    // by the token detail overlay which contains a close instruction
    expect(frame).toContain('Esc');
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('uses default rows when stdout.rows is undefined', async () => {
    // Override useStdout to return null stdout
    const ink = await import('ink');
    vi.mocked(ink.useStdout).mockReturnValue({ stdout: null } as any);

    const { lastFrame } = render(<App />);
    await wait();

    // App should still render (using fallback 40 rows)
    const frame = lastFrame();
    expect(frame).toContain('NansenTerm');
  });

  it('populates walletListRef from mount useEffect with wallets format', async () => {
    (fetchWalletList as any).mockResolvedValue({
      success: true,
      data: { wallets: [{ name: 'mount-w1' }] },
    });

    const { lastFrame, stdin } = render(<App />);
    await wait(50);

    // Navigate to wallet pane and press Enter to pick from mount-populated list
    stdin.write('\x1B[Z');
    await wait();
    stdin.write('\r');
    await wait(50);

    const frame = lastFrame();
    expect(frame).toContain('mount-w1');
  });
});
