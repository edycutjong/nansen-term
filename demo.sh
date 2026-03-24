#!/bin/bash
# ================================================
# DEMO RECORDING SCRIPT — NansenTerm
# Run this while QuickTime / OBS is screen-recording
# Terminal: 120×24 min, recommended 160×40+, full-screen iTerm2
#
# Usage:  chmod +x demo.sh && ./demo.sh
# Notes:
#   • Uses mock mode — no API credits consumed
#   • Follow the on-screen cues to showcase each feature
#   • Press keys as instructed in each scene
#   • Ctrl+C at any time to abort
# ================================================

DELAY=0.06

type_text() {
  for ((i=0; i<${#1}; i++)); do
    printf '%s' "${1:$i:1}"
    sleep $DELAY
  done
}

wait_for_key() {
  echo ""
  echo -e "  \033[33m▶ $1\033[0m"
  echo -e "  \033[90mPress any key to continue...\033[0m"
  read -rsn1
}

# ── Title Card ───────────────────────────────────
clear
echo ""
echo -e "  \033[36m╔══════════════════════════════════════════════════╗\033[0m"
echo -e "  \033[36m║\033[0m        🚀 \033[1mNansenTerm — Full Feature Demo\033[0m          \033[36m║\033[0m"
echo -e "  \033[36m║\033[0m     Terminal Dashboard for Nansen Analytics       \033[36m║\033[0m"
echo -e "  \033[36m╚══════════════════════════════════════════════════╝\033[0m"
echo ""
echo -e "  \033[90m15 scenes · 17 keyboard shortcuts · 18 chains\033[0m"
echo ""
echo -e "  \033[1mDemo Plan:\033[0m"
echo -e "  \033[33m 1.\033[0m  Launch TUI (mock mode)"
echo -e "  \033[33m 2.\033[0m  Navigate panes (Tab)      \033[90mTab / Shift+Tab\033[0m"
echo -e "  \033[33m 3.\033[0m  Jump panes (numbers)      \033[90m1 2 3 4\033[0m"
echo -e "  \033[33m 4.\033[0m  Scroll data              \033[90m↑ ↓\033[0m"
echo -e "  \033[33m 5.\033[0m  Token detail (2 panes)    \033[90mEnter / Esc / 2 Enter / Esc\033[0m"
echo -e "  \033[33m 6.\033[0m  Cycle chains             \033[90mC / Shift+C\033[0m"
echo -e "  \033[33m 7.\033[0m  Switch wallets            \033[90mW / Shift+W\033[0m"
echo -e "  \033[33m 8.\033[0m  Select wallet & balances  \033[90m4 → ↓↓ → Enter → Esc\033[0m"
echo -e "  \033[33m 9.\033[0m  Toggle streaming          \033[90mS (on/off live data)\033[0m"
echo -e "  \033[33m10.\033[0m  Add wallet modal          \033[90mA / Esc\033[0m"
echo -e "  \033[33m11.\033[0m  Trade quote modal         \033[90mQ / Esc\033[0m"
echo -e "  \033[33m12.\033[0m  Execute trade modal       \033[90mT / Esc\033[0m"
echo -e "  \033[33m13.\033[0m  Refresh data              \033[90mR (pane) / P (all)\033[0m"
echo -e "  \033[33m14.\033[0m  Help overlay              \033[90m? / Esc\033[0m"
echo -e "  \033[33m15.\033[0m  Exit                      \033[90mCtrl+C\033[0m"
echo ""

wait_for_key "Scene 1: Launch NansenTerm (mock mode)"

# ── Scene 1: Launch ──────────────────────────────
clear
echo -n "$ "
type_text "npm --silent run mock"
sleep 0.5
echo ""

cd "$(dirname "$0")" 2>/dev/null

echo ""
echo -e "  \033[32m✓ TUI will launch now.\033[0m"
echo ""
echo -e "  \033[1mFollow this sequence during recording:\033[0m"
echo ""
echo -e "  \033[33m Scene  2:\033[0m  Tab Tab Tab Tab       \033[90m(cycle all 4 panes)\033[0m"
echo -e "  \033[33m Scene  3:\033[0m  3 4 2 1               \033[90m(jump to panes by number)\033[0m"
echo -e "  \033[33m Scene  4:\033[0m  ↓ ↓ ↓ ↑ ↑             \033[90m(scroll data rows)\033[0m"
echo -e "  \033[33m Scene  5:\033[0m  Enter … Esc → 2 Enter … Esc  \033[90m(token detail → close → DEX TRADES detail → close)\033[0m"
echo -e "  \033[33m Scene  6:\033[0m  c c c C               \033[90m(chains: SOL → BASE → BNB → back)\033[0m"
echo -e "  \033[33m Scene  7:\033[0m  w … W                 \033[90m(switch wallets forward/back)\033[0m"
echo -e "  \033[33m Scene  8:\033[0m  4 → ↓↓ → Enter → Esc  \033[90m(wallet list → select → balances → back)\033[0m"
echo -e "  \033[33m Scene  9:\033[0m  s … s                 \033[90m(streaming on → data flows → streaming off)\033[0m"
echo -e "  \033[33m Scene 10:\033[0m  a … Esc               \033[90m(add wallet modal → close)\033[0m"
echo -e "  \033[33m Scene 11:\033[0m  q … Esc               \033[90m(quote modal → close)\033[0m"
echo -e "  \033[33m Scene 12:\033[0m  t … Esc               \033[90m(trade modal → close)\033[0m"
echo -e "  \033[33m Scene 13:\033[0m  r … p                 \033[90m(refresh pane / refresh all)\033[0m"
echo -e "  \033[33m Scene 14:\033[0m  ?  … Esc              \033[90m(help overlay → close)\033[0m"
echo -e "  \033[33m Scene 15:\033[0m  Ctrl+C                \033[90m(exit)\033[0m"
echo ""

wait_for_key "Ready? Press any key to launch NansenTerm..."

# Launch the TUI
npm --silent run mock

echo ""
echo -e "  \033[32m🎬 Demo complete — all features showcased!\033[0m"
echo ""
