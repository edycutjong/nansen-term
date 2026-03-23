/**
 * Mock data for NANSEN_MOCK=1 mode — no API calls, safe for UI testing.
 */

const netflowTokens = ['ETH', 'WBTC', 'USDC', 'ARB', 'LINK', 'UNI', 'AAVE', 'PEPE'];
const generateNetflow = () => netflowTokens.map(t => ({
  token_symbol: t,
  net_flow_24h_usd: (Math.random() - 0.5) * 10_000_000,
  net_flow_7d_usd: (Math.random() - 0.5) * 30_000_000
}));

const swapPairs = ['ETH → USDC', 'WBTC → ETH', 'USDC → ARB', 'PEPE → ETH', 'LINK → USDC', 'UNI → WBTC', 'SOL → USDC'];
const generateDexTrades = () => Array.from({ length: 6 }).map((_, i) => ({
  timestamp: Date.now() - (Math.random() * 100_000),
  swap: swapPairs[Math.floor(Math.random() * swapPairs.length)],
  value_usd: Math.random() * 100_000
})).sort((a, b) => b.timestamp - a.timestamp);

const perpSymbols = ['BTC', 'ETH', 'SOL', 'ARB', 'LINK', 'AVAX', 'SUI', 'INJ'];
const generatePerps = () => perpSymbols.map(s => ({
  symbol: s,
  funding_rate: (Math.random() - 0.5) * 0.001,
  oi_change_24h: (Math.random() - 0.5) * 50_000_000
}));

const generateWalletList = () => [
  { name: 'demo-wallet', evm_address: '0xDEAD...BEEF', solana_address: '—' },
];

/**
 * Returns mock data for a given command or null if not matched.
 */
export function getMockData(command: string): unknown | null {
  if (command.includes('netflow'))        return generateNetflow();
  if (command.includes('dex-trades'))     return generateDexTrades();
  if (command.includes('perp screener'))  return generatePerps();
  if (command.includes('wallet list'))    return { wallets: generateWalletList() };
  if (command.includes('wallet show'))    return generateWalletList()[0];
  return null;
}

export const IS_MOCK = process.env['NANSEN_MOCK'] === 'true';
