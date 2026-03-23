import { useEffect } from 'react';
import { useInput } from 'ink';
import type { PaneId } from '../types/nansen.js';

const PANE_ORDER: PaneId[] = ['netflow', 'dex-trades', 'perp', 'wallet'];

interface KeyboardActions {
  onCycleChain: () => void;
  onSwitchWallet: () => void;
  onRefreshCurrent: () => void;
  onRefreshAll: () => void;
  onToggleHelp: () => void;
  onToggleStreaming: () => void;
  onOpenQuote: () => void;
  onExecuteTrade: () => void;
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

    // If an overlay is open, don't process other keys
    if (actions.hasOverlay) return;

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

    // Arrow keys: scroll
    if (key.upArrow) { actions.onScrollUp(); return; }
    if (key.downArrow) { actions.onScrollDown(); return; }

    // Enter: select token
    if (key.return) { actions.onSelectToken(); return; }

    // Hotkeys (lowercase)
    switch (input.toLowerCase()) {
      case 'c': actions.onCycleChain(); break;
      case 'w': actions.onSwitchWallet(); break;
      case 'r': actions.onRefreshCurrent(); break;
      case 'a': actions.onRefreshAll(); break;
      case 's': actions.onToggleStreaming(); break;
      case 'q': actions.onOpenQuote(); break;
      case 'x': actions.onExecuteTrade(); break;
      case '?': actions.onToggleHelp(); break;
    }
  });
}
