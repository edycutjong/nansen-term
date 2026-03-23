/**
 * Mock data for NANSEN_MOCK=1 mode — no API calls, safe for UI testing.
 */

const netflowTokens = ['ETH', 'WBTC', 'USDC', 'ARB', 'LINK', 'UNI', 'AAVE', 'PEPE'];
const generateNetflow = () => netflowTokens.map(t => ({
  token_symbol: t,
  net_flow_24h_usd: (Math.random() - 0.5) * 10_000_000,
  net_flow_7d_usd: (Math.random() - 0.5) * 30_000_000
}));

const swapPairs = [['ETH', 'USDC'], ['WBTC', 'ETH'], ['USDC', 'ARB'], ['PEPE', 'ETH'], ['LINK', 'USDC'], ['UNI', 'WBTC'], ['SOL', 'USDC']];
const generateDexTrades = () => Array.from({ length: 6 }).map((_, i) => {
  const pair = swapPairs[Math.floor(Math.random() * swapPairs.length)];
  return {
    timestamp: new Date(Date.now() - (Math.random() * 100_000)).toISOString(),
    buyer_token_symbol: pair[0],
    seller_token_symbol: pair[1],
    value_usd: Math.random() * 100_000
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

const perpSymbols = ['BTC', 'ETH', 'SOL', 'ARB', 'LINK', 'AVAX', 'SUI', 'INJ'];
const generatePerps = () => perpSymbols.map(s => ({
  symbol: s,
  funding_rate: (Math.random() - 0.5) * 0.1,
  oi_change_24h: (Math.random() - 0.5) * 50_000_000
}));

const generateWalletList = () => [
  { name: 'demo-wallet', evm_address: '0xDEAD...BEEF', solana_address: '—' },
  { name: 'whale-tracker', evm_address: '0x1234...ABCD', solana_address: '—' },
  { name: 'sol-degen', evm_address: '—', solana_address: '7y3g...9vBz' },
  { name: 'main-vault', evm_address: '0x0000...0000', solana_address: '1111...1111' },
];

const TOKEN_DATA: Record<string, { name: string; symbol: string; price: number; marketCap: number; address: string }> = {
  ETH:  { name: 'Ethereum',    symbol: 'ETH',  price: 3452.18,   marketCap: 415_000_000_000, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  WBTC: { name: 'Wrapped BTC', symbol: 'WBTC', price: 97210.55,  marketCap: 12_800_000_000,  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  USDC: { name: 'USD Coin',    symbol: 'USDC', price: 1.0,       marketCap: 60_200_000_000,  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  ARB:  { name: 'Arbitrum',    symbol: 'ARB',  price: 0.82,      marketCap: 3_400_000_000,   address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1' },
  LINK: { name: 'Chainlink',   symbol: 'LINK', price: 14.53,     marketCap: 9_100_000_000,   address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  UNI:  { name: 'Uniswap',     symbol: 'UNI',  price: 7.24,      marketCap: 5_600_000_000,   address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  AAVE: { name: 'Aave',        symbol: 'AAVE', price: 184.30,    marketCap: 2_800_000_000,   address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
  PEPE: { name: 'Pepe',        symbol: 'PEPE', price: 0.0000089, marketCap: 3_700_000_000,   address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
  SOL:  { name: 'Solana',      symbol: 'SOL',  price: 142.67,    marketCap: 65_000_000_000,  address: 'So11111111111111111111111111111111111111112' },
  BTC:  { name: 'Bitcoin',     symbol: 'BTC',  price: 97210.55,  marketCap: 1_900_000_000_000, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
};

const generateTokenInfo = (args: string[]) => {
  // Extract token from --token flag in args
  const tokenIdx = args.indexOf('--token');
  const tokenArg = tokenIdx >= 0 ? args[tokenIdx + 1] ?? '' : '';

  // Try exact match first (e.g. "UNI"), then substring match (e.g. "0x1f9840...UNI")
  const upperArg = tokenArg.toUpperCase();
  const knownSymbol = TOKEN_DATA[upperArg]
    ? upperArg
    : Object.keys(TOKEN_DATA).find(s => upperArg.includes(s));

  const token = TOKEN_DATA[knownSymbol ?? 'ETH'] ?? TOKEN_DATA['ETH']!;
  return {
    name: token.name,
    symbol: token.symbol,
    address: token.address,
    price_usd: token.price,
    price_change_24h: (Math.random() - 0.4) * 8,
    market_cap: token.marketCap,
    volume_24h: token.marketCap * (0.02 + Math.random() * 0.05),
  };
};

const generateTokenIndicators = () => ({
  nansen_score: Math.floor(50 + Math.random() * 50),
  smart_money_score: Math.floor(30 + Math.random() * 70),
});

const generateBalance = () => [
  { token_symbol: 'ETH',  balance: 0.5 + Math.random() * 2,    value_usd: 0 },
  { token_symbol: 'USDC', balance: 500 + Math.random() * 5000,  value_usd: 0 },
  { token_symbol: 'WBTC', balance: 0.01 + Math.random() * 0.05, value_usd: 0 },
  { token_symbol: 'ARB',  balance: 100 + Math.random() * 1000,  value_usd: 0 },
].map(b => ({
  ...b,
  value_usd: b.balance * (TOKEN_DATA[b.token_symbol]?.price ?? 1),
}));

/**
 * Returns mock data for a given command or null if not matched.
 */
export function getMockData(command: string, args: string[] = []): unknown | null {
  if (command.includes('netflow'))           return generateNetflow();
  if (command.includes('dex-trades'))        return generateDexTrades();
  if (command.includes('perp screener'))     return generatePerps();
  if (command.includes('wallet list'))       return { wallets: generateWalletList() };
  if (command.includes('wallet show'))       return generateWalletList()[0];
  if (command.includes('token indicators'))  return generateTokenIndicators();
  if (command.includes('token info'))        return generateTokenInfo(args);
  if (command.includes('profiler balance'))  return generateBalance();
  return null;
}

export const IS_MOCK = process.env['NANSEN_MOCK'] === 'true';
