import React, { useState, useCallback } from 'react';
import { Box } from 'ink';
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
import { nextChain } from './lib/chains.js';
import { getApiCallCount } from './lib/nansen.js';
import type { PaneId, Chain, AppState } from './types/nansen.js';

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

  const handleCycleChain = useCallback(() => {
    setState((s) => ({ ...s, chain: nextChain(s.chain) }));
  }, []);

  const handleSwitchWallet = useCallback(() => {
    // TODO: wallet picker overlay
  }, []);

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

  useKeyboard({
    onCycleChain: handleCycleChain,
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
    <Box flexDirection="column" key={refreshKey}>
      {/* Header */}
      <Header chain={state.chain} walletName={state.walletName} />

      {/* Top row: Netflow + DEX Trades */}
      <Box>
        <NetflowPane
          chain={state.chain}
          isActive={state.activePane === 'netflow'}
          selectedIndex={state.activePane === 'netflow' ? scrollIndex : -1}
        />
        <DexTradesPane
          chain={state.chain}
          isActive={state.activePane === 'dex-trades'}
          selectedIndex={state.activePane === 'dex-trades' ? scrollIndex : -1}
        />
      </Box>

      {/* Bottom row: Perp + Wallet */}
      <Box>
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
