import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, useStdout } from 'ink';
import Header from './components/Header.js';
import StatusBar from './components/StatusBar.js';
import NetflowPane from './components/NetflowPane.js';
import DexTradesPane from './components/DexTradesPane.js';
import PerpPane from './components/PerpPane.js';
import WalletPane from './components/WalletPane.js';
import HelpOverlay from './components/HelpOverlay.js';
import TokenDetail from './components/TokenDetail.js';
import TradeModal from './components/TradeModal.js';
import WalletModal from './components/WalletModal.js';
import { useKeyboard } from './hooks/useKeyboard.js';
import { nextChain, prevChain } from './lib/chains.js';
import { fetchWalletList, getApiCallCount } from './lib/nansen.js';
import type { PaneId, AppState } from './types/nansen.js';

/** Hide terminal cursor and set window title */
export function setupTerminal(): void {
  process.stdout.write('\x1B[?25l');
  process.stdout.write('\x1B]0;NansenTerm\x07');
}

/** Restore terminal cursor and clear window title */
export function cleanupTerminal(): void {
  process.stdout.write('\x1B[?25h');
  process.stdout.write('\x1B]0;\x07');
}

const autoRefreshTimerRef: { current: ReturnType<typeof setInterval> | null } = { current: null };

/** Clear the auto-refresh interval */
export function clearAutoRefresh(): void {
  clearInterval(autoRefreshTimerRef.current as unknown as number);
}

type NotificationType = 'info' | 'warn' | 'error';
interface Notification {
  message: string;
  type: NotificationType;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    activePane: 'netflow',
    chain: 'ethereum',
    walletName: null,
    apiCallCount: 0,
    lastRefresh: new Date(),
    showHelp: false,
    isStreaming: false,
  });

  const [scrollIndex, setScrollIndex] = useState(0);
  const [refreshKeys, setRefreshKeys] = useState<Record<PaneId, number>>({
    netflow: 0,
    'dex-trades': 0,
    perp: 0,
    wallet: 0, 
  });
  const [notification, setNotification] = useState<Notification | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  
  // Overlay states
  const [showTokenDetail, setShowTokenDetail] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [tradeMode, setTradeMode] = useState<'quote' | 'execute'>('quote');
  
  // Data streaming state
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walletListRef = useRef<string[]>([]);
  const walletIndexRef = useRef(0);
  const highlightedTokenRef = useRef<string | null>(null);

  const handleHighlight = useCallback((token: string | null, _pane: PaneId) => {
    highlightedTokenRef.current = token;
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
    clearTimeout(notifTimerRef.current as unknown as number);
    notifTimerRef.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleCycleChain = useCallback(() => {
    setState((s) => ({ ...s, chain: nextChain(s.chain) }));
  }, []);

  const handlePrevChain = useCallback(() => {
    setState((s) => ({ ...s, chain: prevChain(s.chain) }));
  }, []);

  const handleSwitchWallet = useCallback(async () => {
    try {
      const result = await fetchWalletList();
      const wallets = result.success
        ? Array.isArray(result.data)
          ? (result.data as Record<string, unknown>[])
          : ((result.data as Record<string, unknown>)?.wallets as Record<string, unknown>[] ?? [])
        : [];

      if (wallets.length === 0) {
        showNotification('⚠ No wallets found. Run: nansen wallet create', 'warn');
        return;
      }

      const names = wallets.map((w) => String(w.name ?? w.wallet_name ?? '?'));
      walletListRef.current = names;
      walletIndexRef.current = (walletIndexRef.current + 1) % names.length;
      const next = names[walletIndexRef.current]!;
      setState((s) => ({ ...s, walletName: next }));
      showNotification(`✓ Wallet: ${next}`, 'info');
    } catch {
      showNotification('✗ Failed to fetch wallets', 'error');
    }
  }, [showNotification]);

  const handlePrevWallet = useCallback(async () => {
    try {
      const result = await fetchWalletList();
      const wallets = result.success
        ? Array.isArray(result.data)
          ? (result.data as Record<string, unknown>[])
          : ((result.data as Record<string, unknown>)?.wallets as Record<string, unknown>[] ?? [])
        : [];

      if (wallets.length === 0) {
        showNotification('⚠ No wallets found. Run: nansen wallet create', 'warn');
        return;
      }

      const names = wallets.map((w) => String(w.name ?? w.wallet_name ?? '?'));
      walletListRef.current = names;
      walletIndexRef.current = (walletIndexRef.current - 1 + names.length) % names.length;
      const next = names[walletIndexRef.current]!;
      setState((s) => ({ ...s, walletName: next }));
      showNotification(`✓ Wallet: ${next}`, 'info');
    } catch {
      showNotification('✗ Failed to fetch wallets', 'error');
    }
  }, [showNotification]);

  // Keep wallet list names in sync for Enter-to-select
  useEffect(() => {
    const doFetch = async () => {
      try {
        const result = await fetchWalletList();
        const wallets = result.success
          ? Array.isArray(result.data)
            ? (result.data as Record<string, unknown>[])
            : ((result.data as Record<string, unknown>)?.wallets as Record<string, unknown>[] ?? [])
          : [];
        walletListRef.current = wallets.map((w) => String(w.name ?? w.wallet_name ?? '?'));
      } catch { /* ignore */ }
    };
    doFetch();
  }, [refreshKeys.wallet]);


  const handleRefreshCurrent = useCallback(() => {
    setRefreshKeys((keys) => {
      // Get current pane from state.activePane. We can't easily access state.activePane inside
      // a setState callback for another state unless we use the latest value or closure.
      // But we have it via the dependency array. 
      return {
        ...keys,
        [state.activePane]: keys[state.activePane] + 1
      };
    });
    setState((s) => ({ ...s, lastRefresh: new Date(), apiCallCount: getApiCallCount() }));
  }, [state.activePane]);

  const handleRefreshAll = useCallback(() => {
    setRefreshKeys((keys) => ({
      netflow: keys.netflow + 1,
      'dex-trades': keys['dex-trades'] + 1,
      perp: keys.perp + 1,
      wallet: keys.wallet + 1,
    }));
    setState((s) => ({ ...s, lastRefresh: new Date(), apiCallCount: getApiCallCount() }));
  }, []);

  const handleToggleHelp = useCallback(() => {
    setState((s) => ({ ...s, showHelp: !s.showHelp }));
  }, []);

  const handleToggleStreaming = useCallback(() => {
    setState((s) => {
      const nextStreaming = !s.isStreaming;
      if (nextStreaming) {
        setRefreshKeys((keys) => ({
          ...keys,
          'dex-trades': keys['dex-trades'] + 1,
        }));
      }
      return { ...s, isStreaming: nextStreaming };
    });
  }, []);

  const handleOpenQuote = useCallback(() => {
    setState((s) => ({ ...s, showHelp: false }));
    setShowTokenDetail(false);
    setShowWalletModal(false);
    setTradeMode('quote');
    setShowTradeModal(true);
  }, []);

  const handleExecuteTrade = useCallback(() => {
    setState((s) => ({ ...s, showHelp: false }));
    setShowTokenDetail(false);
    setShowWalletModal(false);
    setTradeMode('execute');
    setShowTradeModal(true);
  }, []);

  const handleAddWallet = useCallback(() => {
    setShowWalletModal(true);
  }, []);

  const handleSelectToken = useCallback(() => {
    // If wallet pane is active and no wallet selected, use Enter to pick highlighted wallet
    if (state.activePane === 'wallet' && !state.walletName) {
      const names = walletListRef.current;
      if (names.length > 0) {
        const idx = Math.min(scrollIndex, names.length - 1);
        const picked = names[idx]!;
        setState((s) => ({ ...s, walletName: picked }));
        showNotification(`✓ Wallet: ${picked}`, 'info');
      }
      return;
    }
    if (highlightedTokenRef.current) {
      setSelectedToken(highlightedTokenRef.current);
      setShowTokenDetail(true);
    }
  }, [state.activePane, state.walletName, scrollIndex, showNotification]);

  const handleCloseOverlay = useCallback(() => {
    // Only close overlays — do nothing when no overlay is open
    if (showTokenDetail || showTradeModal || showWalletModal || state.showHelp) {
      setState((s) => ({ ...s, showHelp: false }));
      setShowTokenDetail(false);
      setShowTradeModal(false);
      setShowWalletModal(false);
    }
  }, [showTokenDetail, showTradeModal, showWalletModal, state.showHelp]);

  const handleSetActivePane = useCallback((pane: PaneId) => {
    setState((s) => ({ ...s, activePane: pane }));
    setScrollIndex(0);
  }, []);

  const handleScrollUp = useCallback(() => {
    setScrollIndex((i) => Math.max(0, i - 1));
  }, []);

  // Max visible rows per pane (must match each pane's Table maxRows prop)
  const PANE_MAX_ROWS: Record<PaneId, number> = { netflow: 8, 'dex-trades': 7, perp: 8, wallet: 10 };

  const handleScrollDown = useCallback(() => {
    const max = PANE_MAX_ROWS[state.activePane] - 1;
    setScrollIndex((i) => Math.min(i + 1, max));
  }, [state.activePane]);

  // Auto-refresh timer — only increments trigger, no full remount
  useEffect(() => {
    autoRefreshTimerRef.current = setInterval(() => {
      setRefreshKeys((keys) => ({
        netflow: keys.netflow + 1,
        'dex-trades': keys['dex-trades'] + 1,
        perp: keys.perp + 1,
        wallet: keys.wallet + 1,
      }));
      setState((s) => ({ ...s, lastRefresh: new Date(), apiCallCount: getApiCallCount() }));
    }, 5 * 60_000); // 5 min — conserve API credits
    return clearAutoRefresh;
  }, []);

  // Hide terminal cursor and set window title
  useEffect(() => {
    setupTerminal();
    return cleanupTerminal;
  }, []);

  const { stdout } = useStdout();
  const totalRows = stdout?.rows ?? 40;

  // Prevent list keyboard navigation when an overlay is open
  const hasOverlay = showTokenDetail || showTradeModal || showWalletModal || state.showHelp;

  useKeyboard({
    onCycleChain: handleCycleChain,
    onPrevChain: handlePrevChain,
    onSwitchWallet: handleSwitchWallet,
    onPrevWallet: handlePrevWallet,
    onRefreshCurrent: handleRefreshCurrent,
    onRefreshAll: handleRefreshAll,
    onToggleHelp: handleToggleHelp,
    onToggleStreaming: handleToggleStreaming,
    onOpenQuote: handleOpenQuote,
    onExecuteTrade: handleExecuteTrade,
    onAddWallet: handleAddWallet,
    onSelectToken: handleSelectToken,
    onCloseOverlay: handleCloseOverlay,
    onSetActivePane: handleSetActivePane,
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
    activePane: state.activePane,
    hasOverlay: hasOverlay,
  });

  // Overlays take over the screen
  if (state.showHelp) {
    return (
      <Box flexDirection="column" height={totalRows}>
        <Header chain={state.chain} walletName={state.walletName} mode="help" />
        <HelpOverlay />
      </Box>
    );
  }

  if (showTokenDetail && selectedToken) {
    return (
      <Box flexDirection="column" height={totalRows}>
        <Header chain={state.chain} walletName={state.walletName} mode="token" />
        <TokenDetail chain={state.chain} tokenAddress={selectedToken} />
      </Box>
    );
  }

  if (showTradeModal) {
    return (
      <Box flexDirection="column" height={totalRows}>
        <Header chain={state.chain} walletName={state.walletName} mode="trade" />
        <TradeModal chain={state.chain} walletName={state.walletName} mode={tradeMode} selectedToken={selectedToken} />
      </Box>
    );
  }

  if (showWalletModal) {
    return (
      <Box flexDirection="column" height={totalRows}>
        <Header chain={state.chain} walletName={state.walletName} mode="wallet" />
        <WalletModal />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={totalRows}>
      {/* Header */}
      <Header chain={state.chain} walletName={state.walletName} />

      {/* Top row: Netflow + DEX Trades */}
      <Box flexBasis="50%" flexGrow={1}>
        <NetflowPane
          chain={state.chain}
          isActive={state.activePane === 'netflow'}
          selectedIndex={state.activePane === 'netflow' ? scrollIndex : -1}
          refreshTrigger={refreshKeys.netflow}
          onHighlight={handleHighlight}
        />
        <DexTradesPane
          chain={state.chain}
          isActive={state.activePane === 'dex-trades'}
          selectedIndex={state.activePane === 'dex-trades' ? scrollIndex : -1}
          isStreaming={state.isStreaming}
          refreshTrigger={refreshKeys['dex-trades']}
          onHighlight={handleHighlight}
        />
      </Box>

      {/* Bottom row: Perp + Wallet */}
      <Box flexBasis="50%" flexGrow={1}>
        <PerpPane
          isActive={state.activePane === 'perp'}
          selectedIndex={state.activePane === 'perp' ? scrollIndex : -1}
          refreshTrigger={refreshKeys.perp}
          onHighlight={handleHighlight}
        />
        <WalletPane
          chain={state.chain}
          walletName={state.walletName}
          isActive={state.activePane === 'wallet'}
          refreshTrigger={refreshKeys.wallet}
          selectedIndex={state.activePane === 'wallet' ? scrollIndex : -1}
        />
      </Box>

      {/* Status Bar */}
      <StatusBar
        apiCallCount={getApiCallCount()}
        lastRefresh={state.lastRefresh}
        isStreaming={state.isStreaming}
        notification={notification}
      />
    </Box>
  );
}
