#!/bin/bash
# ================================================
# AUTOPILOT DEMO SCRIPT — NansenTerm
# Run this while QuickTime / OBS is screen-recording
#
# Usage:  chmod +x demo.sh && ./demo.sh
# Notes:  Please maximize your terminal (Recommended 160x45)
# ================================================

cd "$(dirname "$0")" 2>/dev/null

clear
echo ""
echo -e "  \033[36m╔══════════════════════════════════════════════════╗\033[0m"
echo -e "  \033[36m║\033[0m        🚀 \033[1mNansenTerm — Autopilot Demo\033[0m             \033[36m║\033[0m"
echo -e "  \033[36m║\033[0m     Terminal Dashboard for Nansen Analytics       \033[36m║\033[0m"
echo -e "  \033[36m╚══════════════════════════════════════════════════╝\033[0m"
echo ""
echo -e "  \033[90mThis script acts as an automated director.\033[0m"
echo -e "  \033[90mIt will launch the TUI and press all the keys perfectly.\033[0m"
echo ""
echo -e "  \033[1mEnsure your terminal is massive (fullscreen) for 16:9 1080p.\033[0m"
echo ""
echo -n "  ▶ Press any key to begin a 3-second countdown... "
read -rsn1
echo ""
echo ""

for i in 3 2 1; do
  echo -e "  \033[33mStarting in $i...\033[0m"
  sleep 1
done

# The heart of the autopilot — using expect to simulate an actual user typing
expect << 'EOF'
set timeout -1
spawn npm --silent run mock

# Give it time to boot and fetch initial mock data
sleep 3.5

# ── Scene 1: The Pulse (Streaming & Chains)
# Enable streaming
send "s"
sleep 2.5

# Cycle chains (Base, Bnb)
send "c"
sleep 3.0
send "c"
sleep 3.0

# ── Scene 2: Deep Dive Overlays
# Scroll down and open token detail
send "\033\[B"
sleep 0.5
send "\r"
sleep 4.0
send "\033"
sleep 1.0

# Jump to DEX Trades pane (2), pick first, enter detail
send "2"
sleep 1.5
send "\r"
sleep 4.0
send "\033"
sleep 1.0

# ── Scene 3: Portfolio Power
# Jump to Wallet pane (4), scroll down, select
send "4"
sleep 1.5
send "\033\[B"
sleep 0.5
send "\033\[B"
sleep 0.5
send "\r"
sleep 4.0
send "\033"
sleep 1.0

# Cycle header wallet backwards (Shift+W) and forwards (w)
send "W"
sleep 3.0
send "w"
sleep 2.0

# ── Scene 4: Execution Context
# Quote Modal
send "q"
sleep 4.0
send "\033"
sleep 1.0

# Trade Modal
send "t"
sleep 4.0
send "\033"
sleep 1.0

# ── Scene 5: Command Center
# Add Tracked Wallet
send "a"
sleep 3.0
send "\033"
sleep 1.0

# Help Modal
send "?"
sleep 4.0
send "\033"
sleep 1.0

# ── Scene 6: The Outro
# Manual Refresh all
send "p"
sleep 3.0

# Exit cleanly
send "\003"
expect eof
EOF

echo ""
echo -e "  \033[32m🎬 Autopilot demo complete! Stop your screen recording.\033[0m"
echo ""

