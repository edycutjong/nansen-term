#!/bin/bash
# ================================================
# DEMO RECORDING SCRIPT — NansenTerm
# Run this while QuickTime is screen-recording
# Terminal: 160×40+, full screen iTerm2
# ================================================

# Simulates typing text character by character
type_text() {
  for ((i=0; i<${#1}; i++)); do
    printf '%s' "${1:$i:1}"
    sleep 0.06
  done
}

clear
sleep 1

# Scene 1: Launch in mock mode (no API credits used)
echo -n "$ "
type_text "cd NansenTerm"
sleep 0.4
echo ""
cd "$(dirname "$0")/../NansenTerm" 2>/dev/null || cd NansenTerm 2>/dev/null
echo ""
sleep 0.5

echo -n "$ "
type_text "npm --silent run mock"
sleep 0.5
echo ""

# Launch the TUI (Ctrl+C after ~10s to end demo)
npm --silent run mock

echo ""
echo "🎬 Demo complete!"
