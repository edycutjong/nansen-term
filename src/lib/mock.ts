/**
 * Mock data for NANSEN_MOCK=1 mode — no API calls, safe for UI testing.
 * All response shapes match the actual Nansen CLI schema (api.js / cli.js).
 */

// ─── Helpers ───

const randomHex = (len: number) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const fakeEvmAddress = () => `0x${randomHex(40)}`;
const fakeTxHash = () => `0x${randomHex(64)}`;
// Removed fakeSolAddress

// ─── Token Master Data ───

const TOKEN_DATA: Record<string, {
  name: string; symbol: string; price: number;
  marketCap: number; address: string;
}> = {
  ETH:  { name: 'Ethereum',    symbol: 'ETH',  price: 3452.18,   marketCap: 415_000_000_000,  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  WBTC: { name: 'Wrapped BTC', symbol: 'WBTC', price: 97210.55,  marketCap: 12_800_000_000,   address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  USDC: { name: 'USD Coin',    symbol: 'USDC', price: 1.0,       marketCap: 60_200_000_000,   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  ARB:  { name: 'Arbitrum',    symbol: 'ARB',  price: 0.82,      marketCap: 3_400_000_000,    address: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1' },
  LINK: { name: 'Chainlink',   symbol: 'LINK', price: 14.53,     marketCap: 9_100_000_000,    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  UNI:  { name: 'Uniswap',     symbol: 'UNI',  price: 7.24,      marketCap: 5_600_000_000,    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  AAVE: { name: 'Aave',        symbol: 'AAVE', price: 184.30,    marketCap: 2_800_000_000,    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
  PEPE: { name: 'Pepe',        symbol: 'PEPE', price: 0.0000089, marketCap: 3_700_000_000,    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
  SOL:  { name: 'Solana',      symbol: 'SOL',  price: 142.67,    marketCap: 65_000_000_000,   address: 'So11111111111111111111111111111111111111112' },
  BTC:  { name: 'Bitcoin',     symbol: 'BTC',  price: 97210.55,  marketCap: 1_900_000_000_000, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  AVAX: { name: 'Avalanche',   symbol: 'AVAX', price: 27.80,     marketCap: 11_000_000_000,   address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' },
  SUI:  { name: 'Sui',         symbol: 'SUI',  price: 2.30,      marketCap: 6_500_000_000,    address: '0x0000000000000000000000000000000000000000' },
  INJ:  { name: 'Injective',   symbol: 'INJ',  price: 24.15,     marketCap: 2_400_000_000,    address: '0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30' },
};

// ─── Generators ───

const netflowTokens = ['ETH', 'WBTC', 'USDC', 'ARB', 'LINK', 'UNI', 'AAVE', 'PEPE'];

const generateNetflow = (args: string[]) => {
  const chainIdx = args.indexOf('--chain');
  const chain = chainIdx >= 0 ? args[chainIdx + 1] || 'ethereum' : 'ethereum';

  return netflowTokens.map(t => {
    const token = TOKEN_DATA[t]!;
    const inflow = Math.random() * 10_000_000;
    const outflow = Math.random() * 10_000_000;
    return {
      token_symbol: t,
      token_name: token.name,
      token_address: token.address,
      chain,
      net_flow_1h_usd: (Math.random() - 0.5) * 2_000_000,
      net_flow_24h_usd: (Math.random() - 0.5) * 10_000_000,
      net_flow_7d_usd: (Math.random() - 0.5) * 30_000_000,
      net_flow_30d_usd: (Math.random() - 0.5) * 80_000_000,
      inflow_usd: inflow,
      outflow_usd: outflow,
    };
  });
};

const swapPairs: [string, string][] = [
  ['ETH', 'USDC'], ['WBTC', 'ETH'], ['USDC', 'ARB'],
  ['PEPE', 'ETH'], ['LINK', 'USDC'], ['UNI', 'WBTC'], ['SOL', 'USDC'],
];

const generateDexTrades = (args: string[]) => {
  const chainIdx = args.indexOf('--chain');
  const chain = chainIdx >= 0 ? args[chainIdx + 1] || 'ethereum' : 'ethereum';

  return Array.from({ length: 6 }).map(() => {
    const pair = swapPairs[Math.floor(Math.random() * swapPairs.length)]!;
    return {
      timestamp: new Date(Date.now() - Math.random() * 100_000).toISOString(),
      buyer_token_symbol: pair[0],
      seller_token_symbol: pair[1],
      buyer_address: fakeEvmAddress(),
      seller_address: fakeEvmAddress(),
      value_usd: Math.random() * 100_000,
      chain,
      tx_hash: fakeTxHash(),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const perpSymbols = ['BTC', 'ETH', 'SOL', 'ARB', 'LINK', 'AVAX', 'SUI', 'INJ'];

const generatePerps = () => perpSymbols.map(s => {
  const baseOi = 50_000_000 + Math.random() * 200_000_000;
  let price = 1 + Math.random() * 100;
  /* istanbul ignore next */
  if (TOKEN_DATA[s]) {
    price = TOKEN_DATA[s]!.price;
  }
  return {
    symbol: s,
    funding_rate: (Math.random() - 0.5) * 0.1,
    open_interest: baseOi,
    oi_change_24h: (Math.random() - 0.5) * 50_000_000,
    volume_24h: 10_000_000 + Math.random() * 100_000_000,
    price,
  };
});

const generateWalletList = () => [
  { name: 'demo-wallet',   type: 'local', evm_address: '0xDEAD...BEEF', solana_address: '—',           created_at: '2026-03-01T10:00:00.000Z' },
  { name: 'whale-tracker', type: 'local', evm_address: '0x1234...ABCD', solana_address: '—',           created_at: '2026-03-05T14:30:00.000Z' },
  { name: 'sol-degen',     type: 'local', evm_address: '—',             solana_address: '7y3g...9vBz', created_at: '2026-03-10T08:15:00.000Z' },
  { name: 'main-vault',    type: 'local', evm_address: '0x0000...0000', solana_address: '1111...1111', created_at: '2026-02-20T12:00:00.000Z' },
];

const generateTokenInfo = (args: string[]) => {
  // Extract token from --token flag
  const tokenIdx = args.indexOf('--token');
  let tokenArg = '';
  /* istanbul ignore next */
  if (tokenIdx >= 0) {
    tokenArg = args[tokenIdx + 1] || '';
  }

  // Extract chain from --chain flag
  const chainIdx = args.indexOf('--chain');
  let chain = 'ethereum';
  /* istanbul ignore next */
  if (chainIdx >= 0) {
    chain = args[chainIdx + 1] || 'ethereum';
  }

  // Try exact match first
  let knownSymbol: string | undefined;
  const upperArg = tokenArg.toUpperCase();

  if (TOKEN_DATA[upperArg]) {
    knownSymbol = upperArg;
  } else {
    // Try finding by address match
    knownSymbol = Object.keys(TOKEN_DATA).find(
      s => TOKEN_DATA[s]!.address.toLowerCase() === tokenArg.toLowerCase()
    );
    // Finally fall back to substring on the token address looking for familiar symbol (rare, but just in case)
    if (!knownSymbol) {
      knownSymbol = Object.keys(TOKEN_DATA).find(s => upperArg.includes(s));
    }
  }

  const token = TOKEN_DATA[knownSymbol || 'ETH']!;
  return {
    name: token.name,
    token_name: token.name,
    symbol: token.symbol,
    token_symbol: token.symbol,
    address: token.address,
    token_address: token.address,
    chain,
    price_usd: token.price,
    price_change_24h: (Math.random() - 0.4) * 8,
    market_cap: token.marketCap,
    volume_24h: token.marketCap * (0.02 + Math.random() * 0.05),
  };
};

const generateTokenIndicators = () => {
  const nansenScore = Math.floor(50 + Math.random() * 50);
  const smScore = Math.floor(30 + Math.random() * 70);
  return {
    nansen_score: nansenScore,
    smart_money_score: smScore,
    risk_score: Math.floor(10 + Math.random() * 40),
    reward_score: Math.floor(40 + Math.random() * 60),
  };
};

const generateBalance = () => [
  { token_symbol: 'ETH',  token_name: 'Ethereum',    token_address: TOKEN_DATA['ETH']!.address,  balance: 0.5 + Math.random() * 2,    value_usd: 0 },
  { token_symbol: 'USDC', token_name: 'USD Coin',    token_address: TOKEN_DATA['USDC']!.address, balance: 500 + Math.random() * 5000,  value_usd: 0 },
  { token_symbol: 'WBTC', token_name: 'Wrapped BTC', token_address: TOKEN_DATA['WBTC']!.address, balance: 0.01 + Math.random() * 0.05, value_usd: 0 },
  { token_symbol: 'ARB',  token_name: 'Arbitrum',    token_address: TOKEN_DATA['ARB']!.address,  balance: 100 + Math.random() * 1000,  value_usd: 0 },
].map(b => ({
  ...b,
  value_usd: b.balance * TOKEN_DATA[b.token_symbol]!.price,
}));

const generateTradeQuote = (_args: string[]) => {
  return {
    quote_id: "mock_quote_" + randomHex(8),
    expected_output: "0.985",
    price_impact: "0.1%",
    fee: "0.001",
    route: ["ETH", "USDC"]
  };
};

const generateTokenOHLCV = (_args: string[]) => {
  return Array.from({ length: 24 }).map((_, i) => ({
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    open: 100 + Math.random() * 10,
    high: 115 + Math.random() * 5,
    low: 95 + Math.random() * 5,
    close: 105 + Math.random() * 10,
    volume: 1000000 + Math.random() * 500000
  })).reverse();
};

const generateSearch = (_args: string[]) => {
  return [
    { type: "token", name: "Ethereum", symbol: "ETH", address: TOKEN_DATA["ETH"]?.address },
    { type: "token", name: "USD Coin", symbol: "USDC", address: TOKEN_DATA["USDC"]?.address },
  ];
};

const generateAccount = () => {
  return {
    email: "demo@nansen.ai",
    tier: "VIP",
    credits_remaining: 50000,
    credits_reset_at: new Date(Date.now() + 86400000).toISOString()
  };
};

const generateSmartMoneyHoldings = (_args: string[]) => {
  return [
    { token_symbol: "ETH", token_address: TOKEN_DATA["ETH"]?.address, balance: 150000, usd_value: 450000000 },
    { token_symbol: "USDC", token_address: TOKEN_DATA["USDC"]?.address, balance: 120000000, usd_value: 120000000 },
  ];
};

const generatePerpLeaderboard = (_args: string[]) => {
  return [
    { address: fakeEvmAddress(), pnl_usd: 1500000, win_rate: 0.65, trades: 142 },
    { address: fakeEvmAddress(), pnl_usd: 850000, win_rate: 0.58, trades: 89 },
  ];
};

const generatePnlSummary = (_args: string[]) => {
  return {
    total_realized_pnl_usd: 45000,
    total_unrealized_pnl_usd: 12000,
    win_rate: 0.55,
    best_trade_usd: 8500,
    worst_trade_usd: -2100
  };
};

const generateTokenFlowIntelligence = (_args: string[]) => {
  return {
    smart_money_inflow_24h: 1500000,
    smart_money_outflow_24h: 800000,
    exchange_inflow_24h: 5000000,
    exchange_outflow_24h: 4200000
  };
};

/**
 * Returns mock data for a given command or null if not matched.
 */
export function getMockData(command: string, args: string[] = []): unknown | null {
  if (command.includes('netflow'))           return generateNetflow(args);
  if (command.includes('dex-trades'))        return generateDexTrades(args);
  if (command.includes('perp screener'))     return generatePerps();
  if (command.includes('perp leaderboard'))  return generatePerpLeaderboard(args);
  if (command.includes('wallet list'))       return { wallets: generateWalletList() };
  if (command.includes('wallet show')) {
    const nameIdx = args.indexOf('--name');
    const name = nameIdx >= 0 ? args[nameIdx + 1] : undefined;
    const wallets = generateWalletList();
    return name ? (wallets.find(w => w.name === name) ?? wallets[0]) : wallets[0];
  }
  if (command.includes('token indicators'))  return generateTokenIndicators();
  if (command.includes('token info'))        return generateTokenInfo(args);
  if (command.includes('token ohlcv'))       return generateTokenOHLCV(args);
  if (command.includes('token flow-intelligence')) return generateTokenFlowIntelligence(args);
  if (command.includes('profiler balance'))  return generateBalance();
  if (command.includes('profiler pnl-summary')) return generatePnlSummary(args);
  if (command.includes('smart-money holdings')) return generateSmartMoneyHoldings(args);
  if (command.includes('search'))            return generateSearch(args);
  if (command.includes('account'))           return generateAccount();
  if (command.includes('trade quote'))       return generateTradeQuote(args);
  if (command.includes('trade execute'))      return { tx_hash: `0x${randomHex(64)}`, status: 'confirmed', chain: 'solana' };
  return null;
}

export const IS_MOCK = process.env['NANSEN_MOCK'] === 'true';
