import { useEffect } from 'react';
import { useInput } from 'ink';
import type { PaneId } from '../types/nansen.js';

const PANE_ORDER: PaneId[] = ['netflow', 'dex-trades', 'perp', 'wallet'];

interface KeyboardActions {
  onCycleChain: () => void;
  onPrevChain: () => void;
  onSwitchWallet: () => void;
  onRefreshCurrent: () => void;
  onRefreshAll: () => void;
  onToggleHelp: () => void;
  onToggleStreaming: () => void;
  onOpenQuote: () => void;
  onExecuteTrade: () => void;
  onAddWallet: () => void;
  onSelectToken: () => void;
  onCloseOverlay: () => void;
  onSetActivePane: (pane: PaneId) => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
  activePane: PaneId;
  hasOverlay: boolean;
}

export function useKeyboard(actions: KeyboardActions) {
  useInput((input, key) => {
    // Close overlay on Escape
    if (key.escape) {
      actions.onCloseOverlay();
      return;
    }

    // If an overlay is open, only allow a subset of keys
    if (actions.hasOverlay) {
      const char = input?.toLowerCase();
      if (char === 'q') actions.onOpenQuote();
      if (char === 't') actions.onExecuteTrade();
      if (input === 'C') { actions.onPrevChain(); }       // Shift+C = prev chain
      else if (char === 'c') { actions.onCycleChain(); }  // c = next chain
      return;
    }

    // Tab / Shift+Tab: cycle panes
    if (key.tab) {
      const currentIdx = PANE_ORDER.indexOf(actions.activePane);
      if (key.shift) {
        const prevIdx = (currentIdx - 1 + PANE_ORDER.length) % PANE_ORDER.length;
        actions.onSetActivePane(PANE_ORDER[prevIdx]!);
      } else {
        const nextIdx = (currentIdx + 1) % PANE_ORDER.length;
        actions.onSetActivePane(PANE_ORDER[nextIdx]!);
      }
      return;
    }

    // Arrow Left/Right: cycle panes (same as Tab/Shift+Tab)
    if (key.leftArrow) {
      const currentIdx = PANE_ORDER.indexOf(actions.activePane);
      const prevIdx = (currentIdx - 1 + PANE_ORDER.length) % PANE_ORDER.length;
      actions.onSetActivePane(PANE_ORDER[prevIdx]!);
      return;
    }
    if (key.rightArrow) {
      const currentIdx = PANE_ORDER.indexOf(actions.activePane);
      const nextIdx = (currentIdx + 1) % PANE_ORDER.length;
      actions.onSetActivePane(PANE_ORDER[nextIdx]!);
      return;
    }

    // Arrow Up/Down: scroll
    if (key.upArrow) { actions.onScrollUp(); return; }
    if (key.downArrow) { actions.onScrollDown(); return; }

    // Enter: select token
    if (key.return) { actions.onSelectToken(); return; }

    // Hotkeys (c/C for chain direction)
    if (input === 'C') { actions.onPrevChain(); return; }  // Shift+C = prev
    switch (input.toLowerCase()) {
      case 'c': actions.onCycleChain(); break;
      case 'w': actions.onSwitchWallet(); break;
      case 'a': actions.onAddWallet(); break;
      case 'r': actions.onRefreshCurrent(); break;
      case 'p': actions.onRefreshAll(); break;
      case 's': actions.onToggleStreaming(); break;
      case 'q': actions.onOpenQuote(); break;
      case 't': actions.onExecuteTrade(); break;
      case '?': actions.onToggleHelp(); break;
    }
  });
}
