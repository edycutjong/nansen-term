import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useStdout } from 'ink';
import Header from './components/Header.js';
import StatusBar from './components/StatusBar.js';
import NetflowPane from './components/NetflowPane.js';
import DexTradesPane from './components/DexTradesPane.js';
import PerpPane from './components/PerpPane.js';
import WalletPane from './components/WalletPane.js';
import HelpOverlay from './components/HelpOverlay.js';
import TokenDetail from './components/TokenDetail.js';
import TradeModal from './components/TradeModal.js';
import { useKeyboard } from './hooks/useKeyboard.js';
import { nextChain, prevChain } from './lib/chains.js';
import { fetchWalletList, getApiCallCount } from './lib/nansen.js';
import type { PaneId, Chain, AppState } from './types/nansen.js';

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
    lastRefresh: null,
    showHelp: false,
    showTokenDetail: false,
    showTradeModal: false,
    selectedToken: null,
    isStreaming: false,
  });

  const [scrollIndex, setScrollIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState<Notification | null>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walletListRef = useRef<string[]>([]);
  const walletIndexRef = useRef(0);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
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


  const handleRefreshCurrent = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setState((s) => ({ ...s, lastRefresh: new Date(), apiCallCount: getApiCallCount() }));
  }, []);

  const handleRefreshAll = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setState((s) => ({ ...s, lastRefresh: new Date(), apiCallCount: getApiCallCount() }));
  }, []);

  const handleToggleHelp = useCallback(() => {
    setState((s) => ({ ...s, showHelp: !s.showHelp }));
  }, []);

  const handleToggleStreaming = useCallback(() => {
    setState((s) => ({ ...s, isStreaming: !s.isStreaming }));
  }, []);

  const handleOpenQuote = useCallback(() => {
    setState((s) => ({ ...s, showTradeModal: true }));
  }, []);

  const handleExecuteTrade = useCallback(() => {
    // TODO: execute trade flow
  }, []);

  const handleSelectToken = useCallback(() => {
    setState((s) => ({ ...s, showTokenDetail: true }));
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setState((s) => ({
      ...s,
      showHelp: false,
      showTokenDetail: false,
      showTradeModal: false,
    }));
  }, []);

  const handleSetActivePane = useCallback((pane: PaneId) => {
    setState((s) => ({ ...s, activePane: pane }));
    setScrollIndex(0);
  }, []);

  const handleScrollUp = useCallback(() => {
    setScrollIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleScrollDown = useCallback(() => {
    setScrollIndex((i) => i + 1);
  }, []);

  // 60-second auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey((k) => k + 1);
      setState((s) => ({ ...s, lastRefresh: new Date(), apiCallCount: getApiCallCount() }));
    }, 5 * 60_000); // 5 min — conserve API credits
    return () => clearInterval(timer);
  }, []);

  const { stdout } = useStdout();
  const totalRows = stdout?.rows ?? 40;

  useKeyboard({
    onCycleChain: handleCycleChain,
    onPrevChain: handlePrevChain,
    onSwitchWallet: handleSwitchWallet,
    onRefreshCurrent: handleRefreshCurrent,
    onRefreshAll: handleRefreshAll,
    onToggleHelp: handleToggleHelp,
    onToggleStreaming: handleToggleStreaming,
    onOpenQuote: handleOpenQuote,
    onExecuteTrade: handleExecuteTrade,
    onSelectToken: handleSelectToken,
    onCloseOverlay: handleCloseOverlay,
    onSetActivePane: handleSetActivePane,
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
    activePane: state.activePane,
    hasOverlay: state.showHelp || state.showTokenDetail || state.showTradeModal,
  });

  // Overlays take over the screen
  if (state.showHelp) {
    return (
      <Box flexDirection="column">
        <Header chain={state.chain} walletName={state.walletName} />
        <HelpOverlay />
      </Box>
    );
  }

  if (state.showTokenDetail && state.selectedToken) {
    return (
      <Box flexDirection="column">
        <Header chain={state.chain} walletName={state.walletName} />
        <TokenDetail chain={state.chain} tokenAddress={state.selectedToken} />
      </Box>
    );
  }

  if (state.showTradeModal) {
    return (
      <Box flexDirection="column">
        <Header chain={state.chain} walletName={state.walletName} />
        <TradeModal chain={state.chain} walletName={state.walletName} />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height={totalRows} key={refreshKey}>
      {/* Header */}
      <Header chain={state.chain} walletName={state.walletName} />

      {/* Notification banner */}
      {notification && (
        <Box paddingX={2}>
          <Text
            color={notification.type === 'error' ? 'red' : notification.type === 'warn' ? 'yellow' : 'cyan'}
            bold
          >
            {notification.message}
          </Text>
        </Box>
      )}

      {/* Top row: Netflow + DEX Trades */}
      <Box flexGrow={1}>
        <NetflowPane
          chain={state.chain}
          isActive={state.activePane === 'netflow'}
          selectedIndex={state.activePane === 'netflow' ? scrollIndex : -1}
        />
        <DexTradesPane
          chain={state.chain}
          isActive={state.activePane === 'dex-trades'}
          selectedIndex={state.activePane === 'dex-trades' ? scrollIndex : -1}
          isStreaming={state.isStreaming}
        />
      </Box>

      {/* Bottom row: Perp + Wallet */}
      <Box flexGrow={1}>
        <PerpPane
          isActive={state.activePane === 'perp'}
          selectedIndex={state.activePane === 'perp' ? scrollIndex : -1}
        />
        <WalletPane
          chain={state.chain}
          walletName={state.walletName}
          isActive={state.activePane === 'wallet'}
        />
      </Box>

      {/* Status Bar */}
      <StatusBar
        apiCallCount={getApiCallCount()}
        lastRefresh={state.lastRefresh}
        isStreaming={state.isStreaming}
      />
    </Box>
  );
}
