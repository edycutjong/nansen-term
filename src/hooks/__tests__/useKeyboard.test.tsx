import { act } from 'react';
import { render } from 'ink-testing-library';
import { useKeyboard } from '../useKeyboard.js';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useInput } from 'ink';

const renderHook = <Result,>(renderHookFn: () => Result) => {
  let result: { current: Result | undefined } = { current: undefined };

  const TestComponent = () => {
    result.current = renderHookFn();
    return null;
  };

  const { unmount } = render(<TestComponent />);

  return { result: result as { current: Result }, unmount };
};

// Mock ink's useInput
vi.mock('ink', () => ({
  useInput: vi.fn(),
  Text: () => null,
  Box: () => null
}));

describe('useKeyboard', () => {
  let mockUseInputCallback: (input: string, key: Record<string, boolean>) => void;
  
  const createMockActions = () => ({
    onCycleChain: vi.fn(),
    onPrevChain: vi.fn(),
    onSwitchWallet: vi.fn(),
    onPrevWallet: vi.fn(),
    onRefreshCurrent: vi.fn(),
    onRefreshAll: vi.fn(),
    onToggleHelp: vi.fn(),
    onToggleStreaming: vi.fn(),
    onOpenQuote: vi.fn(),
    onExecuteTrade: vi.fn(),
    onAddWallet: vi.fn(),
    onSelectToken: vi.fn(),
    onCloseOverlay: vi.fn(),
    onSetActivePane: vi.fn(),
    onScrollUp: vi.fn(),
    onScrollDown: vi.fn(),
    activePane: 'netflow' as any,
    hasOverlay: false
  });

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Capture the callback passed to useInput so we can simulate key presses
    vi.mocked(useInput).mockImplementation((callback: any) => {
      mockUseInputCallback = callback;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers useInput hook', () => {
    renderHook(() => useKeyboard(createMockActions()));
    expect(useInput).toHaveBeenCalled();
  });

  it('calls onCloseOverlay on escape', () => {
    const actions = createMockActions();
    renderHook(() => useKeyboard(actions));

    act(() => mockUseInputCallback('', { escape: true }));
    expect(actions.onCloseOverlay).toHaveBeenCalled();
  });

  describe('with overlay active', () => {
    it('restricts to quote and trade hotkeys', () => {
      const actions = createMockActions();
      actions.hasOverlay = true;
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('q', {}));
      expect(actions.onOpenQuote).toHaveBeenCalled();

      act(() => mockUseInputCallback('t', {}));
      expect(actions.onExecuteTrade).toHaveBeenCalled();

      act(() => mockUseInputCallback('c', {}));
      expect(actions.onCycleChain).toHaveBeenCalled();

      act(() => mockUseInputCallback('C', {}));
      expect(actions.onPrevChain).toHaveBeenCalled();
      
      // These should not be called while overlay active
      act(() => mockUseInputCallback('r', {}));
      expect(actions.onRefreshCurrent).not.toHaveBeenCalled();
    });

    it('allows wallet switch/prev in overlay mode', () => {
      const actions = createMockActions();
      actions.hasOverlay = true;
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('w', {}));
      expect(actions.onSwitchWallet).toHaveBeenCalled();

      act(() => mockUseInputCallback('W', {}));
      expect(actions.onPrevWallet).toHaveBeenCalled();
    });
  });

  describe('pane navigation', () => {
    it('cycles panes on tab', () => {
      const actions = createMockActions();
      actions.activePane = 'netflow';
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('', { tab: true }));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('dex-trades');
    });

    it('cycles panes backwards on shift+tab', () => {
      const actions = createMockActions();
      actions.activePane = 'netflow';
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('', { tab: true, shift: true }));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('wallet');
    });

    it('cycles panes on left/right arrows', () => {
      const actions = createMockActions();
      actions.activePane = 'dex-trades';
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('', { rightArrow: true }));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('perp');

      act(() => mockUseInputCallback('', { leftArrow: true }));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('netflow');
    });
  });

  describe('scrolling', () => {
    it('calls onScrollUp/Down on up/down arrows', () => {
      const actions = createMockActions();
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('', { upArrow: true }));
      expect(actions.onScrollUp).toHaveBeenCalled();

      act(() => mockUseInputCallback('', { downArrow: true }));
      expect(actions.onScrollDown).toHaveBeenCalled();
    });
  });

  describe('hotkeys', () => {
    it('triggers correct actions for character inputs', () => {
      const actions = createMockActions();
      renderHook(() => useKeyboard(actions));

      const mapping: Record<string, keyof typeof actions> = {
        'c': 'onCycleChain',
        'C': 'onPrevChain',
        'w': 'onSwitchWallet',
        'W': 'onPrevWallet',
        '?': 'onToggleHelp',
        'a': 'onAddWallet',
        'r': 'onRefreshCurrent',
        'p': 'onRefreshAll',
        's': 'onToggleStreaming',
        'q': 'onOpenQuote',
        't': 'onExecuteTrade',
      };

      for (const [char, actionName] of Object.entries(mapping)) {
        act(() => mockUseInputCallback(char, {}));
        expect(actions[actionName as keyof typeof actions]).toHaveBeenCalled();
      }
    });

    it('triggers action on Enter key', () => {
      const actions = createMockActions();
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('', { return: true }));
      expect(actions.onSelectToken).toHaveBeenCalled();
    });
  });

  describe('number key pane jumping', () => {
    it('jumps to specific pane on number keys 1-4', () => {
      const actions = createMockActions();
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('1', {}));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('netflow');

      actions.onSetActivePane.mockClear();
      act(() => mockUseInputCallback('2', {}));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('dex-trades');

      actions.onSetActivePane.mockClear();
      act(() => mockUseInputCallback('3', {}));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('perp');

      actions.onSetActivePane.mockClear();
      act(() => mockUseInputCallback('4', {}));
      expect(actions.onSetActivePane).toHaveBeenCalledWith('wallet');
    });

    it('ignores invalid number keys like 5', () => {
      const actions = createMockActions();
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('5', {}));
      expect(actions.onSetActivePane).not.toHaveBeenCalled();
    });

    it('ignores number key 0', () => {
      const actions = createMockActions();
      renderHook(() => useKeyboard(actions));

      act(() => mockUseInputCallback('0', {}));
      expect(actions.onSetActivePane).not.toHaveBeenCalled();
    });
  });
});
