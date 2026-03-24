#!/bin/bash
# ================================================
# DEMO RECORDING SCRIPT — NansenTerm
# Run this while QuickTime / OBS is screen-recording
# Recommended Size: 160×45 (Terminal full-screen or large window 16:9)
#
# Usage:  chmod +x demo.sh && ./demo.sh
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
  echo -e "  \033[90mPress any key when ready contextually...\033[0m"
  read -rsn1
}

# ── Title Card ───────────────────────────────────
clear
echo ""
echo -e "  \033[36m╔══════════════════════════════════════════════════╗\033[0m"
echo -e "  \033[36m║\033[0m        🚀 \033[1mNansenTerm — The Director's Cut\033[0m       \033[36m║\033[0m"
echo -e "  \033[36m║\033[0m     Terminal Dashboard for Nansen Analytics       \033[36m║\033[0m"
echo -e "  \033[36m╚══════════════════════════════════════════════════╝\033[0m"
echo ""
echo -e "  \033[90mThe most impactful way to show the CLI challenge submission.\033[0m"
echo ""
echo -e "  \033[1mRecording Flow (6 Power Scenes):\033[0m"
echo ""
echo -e "  \033[33m1. The Pulse (Alive Data)\033[0m"
echo -e "     • Press \033[1;32mS\033[0m to enable streaming. Watch rows flash."
echo -e "     • Press \033[1;32mC\033[0m twice to cycle ETH -> SOL -> BASE tracking."
echo ""
echo -e "  \033[33m2. Deep Dive Overlays\033[0m"
echo -e "     • Arrow down (\033[1;32m↓\033[0m), hit \033[1;32mEnter\033[0m (shows Token Detail). Press \033[1;32mEsc\033[0m."
echo -e "     • Press \033[1;32m2\033[0m (Jump to DEX), hit \033[1;32mEnter\033[0m (shows DEX Token). Press \033[1;32mEsc\033[0m."
echo ""
echo -e "  \033[33m3. Portfolio Power\033[0m"
echo -e "     • Press \033[1;32m4\033[0m (Jump to Wallets). Arrow down (\033[1;32m↓\033[0m)."
echo -e "     • Hit \033[1;32mEnter\033[0m to open Wallet Balances overlay. Press \033[1;32mEsc\033[0m."
echo -e "     • Press \033[1;32mW\033[0m to cycle the active wallet in the header."
echo ""
echo -e "  \033[33m4. Execution Context\033[0m"
echo -e "     • Press \033[1;32mQ\033[0m to open Swap Quote overlay. Press \033[1;32mEsc\033[0m."
echo -e "     • Press \033[1;32mT\033[0m to open Trade Execution overlay. Press \033[1;32mEsc\033[0m."
echo ""
echo -e "  \033[33m5. Command Center\033[0m"
echo -e "     • Press \033[1;32mA\033[0m to open Add Tracked Wallet. Press \033[1;32mEsc\033[0m."
echo -e "     • Press \033[1;32m?\033[0m to toggle Help panel. Press \033[1;32mEsc\033[0m."
echo ""
echo -e "  \033[33m6. The Outro\033[0m"
echo -e "     • Press \033[1;32mP\033[0m to manually refresh all panes."
echo -e "     • Press \033[1;32mCtrl+C\033[0m to exit gracefully."
echo ""
wait_for_key "Ready to record? Launching TUI..."

# ── Launch ──────────────────────────────
clear
echo -n "$ "
type_text "npm --silent run mock"
sleep 0.5
echo ""

cd "$(dirname "$0")" 2>/dev/null
npm --silent run mock

