#!/bin/bash
# ================================================
# AUTOPILOT DEMO SCRIPT — NansenTerm
# Uses AppleScript (osascript) — zero dependencies, native macOS
# Run while QuickTime / OBS is screen-recording.
#
# Usage:  chmod +x demo.sh && ./demo.sh
# Notes:  Maximize your terminal first (160×45 recommended)
#         Grant Accessibility: System Settings → Privacy & Security → Accessibility → Terminal ✓
# ================================================

cd "$(dirname "$0")" 2>/dev/null

# ── Helpers ─────────────────────────────────────
# Send a printable keystroke
key() {
  osascript -e "tell application \"System Events\" to keystroke \"$1\""
}
# Send a special key by macOS key code
# 36=Enter  53=Escape  125=↓  126=↑  8=C (used with control for Ctrl+C)
special() {
  osascript -e "tell application \"System Events\" to key code $1"
}
# Send Ctrl+C
ctrlc() {
  osascript -e "tell application \"System Events\" to key code 8 using {control down}"
}

# ── Intro Screen ─────────────────────────────────
clear
echo ""
echo -e "  \033[36m╔══════════════════════════════════════════════════╗\033[0m"
echo -e "  \033[36m║\033[0m        🚀 \033[1mNansenTerm — Autopilot Demo\033[0m             \033[36m║\033[0m"
echo -e "  \033[36m║\033[0m     Terminal Dashboard for Nansen Analytics       \033[36m║\033[0m"
echo -e "  \033[36m╚══════════════════════════════════════════════════╝\033[0m"
echo ""
echo -e "  \033[90m• Keys are sent automatically via AppleScript — no dependencies\033[0m"
echo -e "  \033[90m• 6 scenes, ~60s total\033[0m"
echo ""
echo -e "  \033[1mBefore you start:\033[0m"
echo -e "    1. Maximize this terminal window (fullscreen 160×45)"
echo -e "    2. Allow Accessibility: System Settings → Privacy & Security → Accessibility → ✓ Terminal (or iTerm2)"
echo -e "    3. Start your screen recorder (QuickTime or OBS)"
echo ""
echo -n "  ▶ Press any key to begin a 3-second countdown... "
read -rsn1
echo -e "\n"

for i in 3 2 1; do
  echo -e "  \033[33mStarting in $i...\033[0m"
  sleep 1
done
clear

# ── Autopilot Background Driver ──────────────────
# Forks a subshell that injects keystrokes while the TUI runs in the foreground
(
  sleep 4.0   # Wait for TUI to fully boot and paint

  # ── Scene 1: The Pulse — enable streaming, chain cycle
  key "s";        sleep 2.5   # Start streaming
  key "c";        sleep 3.0   # Cycle: ETH → SOL
  key "c";        sleep 3.0   # Cycle: SOL → BASE

  # ── Scene 2: Deep Dive Overlays
  special 125;    sleep 0.4   # Arrow Down (select row)
  special 36;     sleep 4.0   # Enter → Token Detail overlay
  special 53;     sleep 1.2   # Escape → close
  key "2";        sleep 1.5   # Jump to DEX Trades pane
  special 36;     sleep 4.0   # Enter → DEX Token Detail overlay
  special 53;     sleep 1.2   # Escape → close

  # ── Scene 3: Portfolio Power
  key "4";        sleep 1.5   # Jump to Wallet pane
  special 125;    sleep 0.4   # Arrow Down
  special 125;    sleep 0.4   # Arrow Down
  special 36;     sleep 4.0   # Enter → Wallet Balances overlay
  special 53;     sleep 1.2   # Escape → close
  key "W";        sleep 3.0   # Cycle wallet backwards (Shift+W)
  key "w";        sleep 2.0   # Cycle wallet forwards

  # ── Scene 4: Execution Context
  key "q";        sleep 4.0   # Swap Quote modal
  special 53;     sleep 1.2   # Escape
  key "t";        sleep 4.0   # Trade Execution modal
  special 53;     sleep 1.2   # Escape

  # ── Scene 5: Command Center
  key "a";        sleep 3.0   # Add Tracked Wallet modal
  special 53;     sleep 1.2   # Escape
  osascript -e 'tell application "System Events" to keystroke "?" using {}'; sleep 4.0  # Help overlay
  special 53;     sleep 1.2   # Escape

  # ── Scene 6: The Outro
  key "p";        sleep 3.0   # Refresh all panes

  # Exit cleanly
  ctrlc
) &
AUTOPILOT_PID=$!

# ── Launch TUI in Foreground ─────────────────────
npm --silent run mock

# Cleanup autopilot subshell if TUI exits on its own
kill $AUTOPILOT_PID 2>/dev/null

echo ""
echo -e "  \033[32m🎬 Autopilot demo complete! Stop your screen recording.\033[0m"
echo ""
