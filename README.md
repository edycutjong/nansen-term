# NansenTerm ⌨️

> *"Web apps are bloated. Real degens stay in the terminal."*

**NansenTerm** is a full-screen Terminal User Interface (TUI) that transforms the [Nansen CLI](https://github.com/nansen-ai/nansen-cli) into an interactive, keyboard-navigable Bloomberg-style dashboard for on-chain analytics.

![NansenTerm](https://img.shields.io/badge/status-in%20development-orange) ![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 📊 **Multi-pane layout** — Smart Money flows, DEX trades, perp data, and wallet info side-by-side
- 🔄 **Live data streaming** — NDJSON streaming for real-time DEX trade updates
- ⌨️ **Keyboard navigation** — Tab between panes, arrow keys to scroll, hotkeys for actions
- 💱 **1-keystroke trading** — `[Q]` for swap quote, `[X]` to execute via `trade quote`/`trade execute`
- 🔗 **18-chain support** — Cycle through all supported chains with `[C]`
- 📋 **Clean tables** — Formatted ASCII tables, not raw JSON walls

## Quick Start

**Minimum requirement: just a Nansen API key.** No wallet needed to view analytics.

> **Terminal size:** minimum **120 columns × 24 rows**.  
> For demo, **160×40** (or full-screen iTerm2/Terminal) is recommended.

```bash
# 1. Install nansen-cli and authenticate
npm install -g nansen-cli
nansen login --api-key YOUR_API_KEY   # get key: app.nansen.ai/auth/agent-setup

# 2. Clone and run NansenTerm
git clone https://github.com/edycutjong/nansen-term.git
cd nansen-term
npm install
npm run dev
```

> **Wallet is optional.** The Netflow, DEX Trades, and Perp panes work without a wallet.
> Only the `[Q]` trade quote and `[X]` execute features require one:
> ```bash
> nansen wallet create   # only needed for trading
> ```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Cycle through panes |
| `↑` / `↓` | Scroll within active pane |
| `Enter` | Select token → open detail overlay |
| `C` | Cycle chain (ethereum → solana → base → ...) |
| `W` | Switch wallet |
| `Q` | Open trade quote modal |
| `X` | Execute quoted trade (confirmation required) |
| `R` | Refresh current pane |
| `A` | Refresh all panes |
| `S` | Toggle streaming mode |
| `?` | Help overlay |
| `Esc` | Close overlay / go back |
| `Ctrl+C` | Exit |

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  NansenTerm v1.0.0    Chain: [ethereum ▸]    Wallet: [my-wallet]   │
│  ⌨ [Tab] Switch Pane  [C] Chain  [W] Wallet  [Q] Quote  [?] Help  │
├────────────────────────────────┬────────────────────────────────────┤
│  📊 SMART MONEY NETFLOW       │  🔄 DEX TRADES (Live)              │
│                                │                                    │
│  Token    24h Flow    7d Flow  │  Time   Buyer→Seller  Value       │
│  ─────    ────────    ───────  │  ─────  ───────────── ─────       │
│  WETH     +$2.3M     +$5.1M   │  15:55  WETH→RETH     $40,789    │
│  USDC     +$1.1M     +$3.2M   │  15:50  ADS→HIVISION  $965       │
│                                │                                    │
├────────────────────────────────┼────────────────────────────────────┤
│  📈 PERP SCREENER             │  🏦 WALLET                         │
│                                │                                    │
│  Symbol  Funding   OI Change  │  Name: my-wallet                   │
│  BTC     +0.012%   +$2.1M    │  ETH:  0.5 ($1,065)               │
│  ETH     +0.008%   +$1.3M    │  SOL:  12.5 ($1,112)              │
│                                │                                    │
├────────────────────────────────┴────────────────────────────────────┤
│  Status: ✓ Connected · 42 API calls · Last refresh: 15:55:23 WIB  │
└─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20+ |
| **TUI Framework** | [Ink v5](https://github.com/vadimdemedes/ink) (React for CLI) |
| **CLI Execution** | `child_process.execFile` / `spawn` |
| **State Management** | React hooks |
| **Streaming** | NDJSON via `--stream` flag |

## Nansen CLI Endpoints Used

20+ endpoints across `research`, `trade`, and `wallet` commands:

- `research smart-money netflow/dex-trades/holdings`
- `research perp screener/leaderboard`
- `research token info/indicators/ohlcv/screener/flow-intelligence`
- `research profiler balance/pnl-summary`
- `research search`
- `trade quote/execute`
- `wallet list/show/create`
- `account`

## Supported Chains

`ethereum` `solana` `base` `bnb` `arbitrum` `polygon` `optimism` `avalanche` `linea` `scroll` `mantle` `ronin` `sei` `plasma` `sonic` `monad` `hyperevm` `iotaevm`

## Development

```bash
npm run dev       # Run with tsx (hot reload)
npm run build     # Compile TypeScript
npm start         # Run compiled version
```

## Built For

Week 2 of the [Nansen CLI Build Challenge](https://x.com/nansen_ai) — `#NansenCLI`

## License

[MIT](LICENSE) © [edycutjong](https://github.com/edycutjong)
