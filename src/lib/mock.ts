/**
 * Mock data for NANSEN_MOCK=1 mode — no API calls, safe for UI testing.
 */

const netflowMock = [
  { token_symbol: 'ETH',   net_flow_24h_usd: 4_200_000,  net_flow_7d_usd: 18_500_000 },
  { token_symbol: 'WBTC',  net_flow_24h_usd: 1_800_000,  net_flow_7d_usd: -2_300_000 },
  { token_symbol: 'USDC',  net_flow_24h_usd: -950_000,   net_flow_7d_usd: 3_400_000  },
  { token_symbol: 'ARB',   net_flow_24h_usd: 620_000,    net_flow_7d_usd: 1_100_000  },
  { token_symbol: 'LINK',  net_flow_24h_usd: -430_000,   net_flow_7d_usd: -800_000   },
  { token_symbol: 'UNI',   net_flow_24h_usd: 310_000,    net_flow_7d_usd: 540_000    },
  { token_symbol: 'AAVE',  net_flow_24h_usd: 210_000,    net_flow_7d_usd: 900_000    },
  { token_symbol: 'PEPE',  net_flow_24h_usd: -120_000,   net_flow_7d_usd: -380_000   },
];

const dexTradesMock = [
  { timestamp: Date.now() - 5_000,  swap: 'ETH → USDC',  value_usd: 28_400 },
  { timestamp: Date.now() - 12_000, swap: 'WBTC → ETH',  value_usd: 91_200 },
  { timestamp: Date.now() - 23_000, swap: 'USDC → ARB',  value_usd: 5_800  },
  { timestamp: Date.now() - 41_000, swap: 'PEPE → ETH',  value_usd: 1_200  },
  { timestamp: Date.now() - 67_000, swap: 'LINK → USDC', value_usd: 14_600 },
  { timestamp: Date.now() - 88_000, swap: 'UNI → WBTC',  value_usd: 7_900  },
];

const perpMock = [
  { symbol: 'BTC',  funding_rate: 0.00014, oi_change_24h: 48_000_000  },
  { symbol: 'ETH',  funding_rate: 0.00008, oi_change_24h: 21_000_000  },
  { symbol: 'SOL',  funding_rate: 0.00031, oi_change_24h: 9_400_000   },
  { symbol: 'ARB',  funding_rate: -0.00005, oi_change_24h: -3_200_000 },
  { symbol: 'LINK', funding_rate: 0.00012, oi_change_24h: 1_800_000   },
  { symbol: 'AVAX', funding_rate: 0.00006, oi_change_24h: 2_100_000   },
  { symbol: 'SUI',  funding_rate: 0.00042, oi_change_24h: 5_600_000   },
  { symbol: 'INJ',  funding_rate: -0.00018, oi_change_24h: -980_000   },
];

const walletListMock = [
  { name: 'demo-wallet', evm_address: '0xDEAD...BEEF', solana_address: '—' },
];

/**
 * Returns mock data for a given command or null if not matched.
 */
export function getMockData(command: string): unknown | null {
  if (command.includes('netflow'))        return netflowMock;
  if (command.includes('dex-trades'))     return dexTradesMock;
  if (command.includes('perp screener'))  return perpMock;
  if (command.includes('wallet list'))    return { wallets: walletListMock };
  if (command.includes('wallet show'))    return walletListMock[0];
  return null;
}

export const IS_MOCK = process.env['NANSEN_MOCK'] === 'true';
