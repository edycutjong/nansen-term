import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMockData } from '../mock.js';

describe('mock', () => {
  beforeEach(() => {
    // Reset Math.random behavior to be deterministic for tests if needed
    // However, we just need branch coverage, so exact values don't strictly matter
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('netflow generator respects --chain', () => {
    const dataEth = getMockData('research smart-money netflow') as any[];
    expect(dataEth[0].chain).toBe('ethereum');

    const dataSol = getMockData('research smart-money netflow', ['--chain', 'solana']) as any[];
    expect(dataSol[0].chain).toBe('solana');
  });

  it('dex-trades generator respects --chain', () => {
    const defaultData = getMockData('research smart-money dex-trades') as any[];
    expect(defaultData[0].chain).toBe('ethereum');

    const solData = getMockData('research smart-money dex-trades', ['--chain', 'solana']) as any[];
    expect(solData[0].chain).toBe('solana');
  });

  it('generates perps', () => {
    const data = getMockData('research perp screener');
    expect(Array.isArray(data)).toBe(true);
  });

  it('generates perp leaderboard', () => {
    const data = getMockData('research perp leaderboard');
    expect(Array.isArray(data)).toBe(true);
  });

  it('generates wallet list', () => {
    const data = getMockData('wallet list') as any;
    expect(Array.isArray(data.wallets)).toBe(true);
  });

  it('handles wallet show', () => {
    const dataDefault = getMockData('wallet show') as any;
    expect(dataDefault.name).toBe('demo-wallet');

    const dataSpecific = getMockData('wallet show', ['--name', 'sol-degen']) as any;
    expect(dataSpecific.name).toBe('sol-degen');

    const dataUnknown = getMockData('wallet show', ['--name', 'unknown-wallet']) as any;
    // Returns first wallet if not found
    expect(dataUnknown.name).toBe('demo-wallet');
  });

  it('generates token indicators', () => {
    const data = getMockData('research token indicators');
    expect(data).toHaveProperty('nansen_score');
  });

  it('handles token info', () => {
    // default cases
    const tDefault = getMockData('research token info') as any;
    expect(tDefault.symbol).toBe('ETH');
    expect(tDefault.chain).toBe('ethereum');

    // custom chain and exact symbol match
    const tLink = getMockData('research token info', ['--chain', 'base', '--token', 'LINK']) as any;
    expect(tLink.symbol).toBe('LINK');
    expect(tLink.chain).toBe('base');

    // address match
    const ethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const tAddr = getMockData('research token info', ['--token', ethAddress]) as any;
    expect(tAddr.symbol).toBe('ETH');

    // known symbol match via substring fallback
    const tSub = getMockData('research token info', ['--token', 'UNIswAP']) as any;
    // Actually the mock substring search relies on upperArg (UNISWAP).includes(s) where s is keys
    // wait, keys are UNI. So 'UNISWAP'.includes('UNI') is true.
    expect(tSub.symbol).toBe('UNI');

    // totally unknown match
    const tUnknown = getMockData('research token info', ['--token', 'UNKNOWNXYZ']) as any;
    expect(tUnknown.symbol).toBe('ETH'); // Falls back to ETH
  });

  it('generates token ohlcv', () => {
    const data = getMockData('research token ohlcv') as any[];
    expect(data.length).toBe(24);
  });

  it('generates token flow-intelligence', () => {
    const data = getMockData('research token flow-intelligence') as any;
    expect(data).toHaveProperty('exchange_inflow_24h');
  });

  it('generates profiler balance', () => {
    const data = getMockData('research profiler balance') as any[];
    expect(data[0].token_symbol).toBe('ETH');
  });

  it('generates profiler pnl-summary', () => {
    const data = getMockData('research profiler pnl-summary') as any;
    expect(data).toHaveProperty('total_realized_pnl_usd');
  });

  it('generates smart-money holdings', () => {
    const data = getMockData('research smart-money holdings') as any[];
    expect(data.length).toBe(2);
  });

  it('generates search', () => {
    const data = getMockData('research search') as any[];
    expect(data.length).toBe(2);
  });

  it('generates account', () => {
    const data = getMockData('account') as any;
    expect(data.tier).toBe('VIP');
  });

  it('generates trade quote', () => {
    const data = getMockData('trade quote') as any;
    expect(data.price_impact).toBe('0.1%');
  });

  it('returns null for unknown command', () => {
    expect(getMockData('unknown command')).toBeNull();
  });

  describe('argument parsing edge cases', () => {
    it('handles missing --chain value gracefully', () => {
      const dataEthArgStr = getMockData('research smart-money netflow', ['--chain']) as any[];
      expect(dataEthArgStr[0].chain).toBe('ethereum');

      const dataDexArgStr = getMockData('research smart-money dex-trades', ['--chain']) as any[];
      expect(dataDexArgStr[0].chain).toBe('ethereum');

      const dataAccount = getMockData('account', ['--chain']) as any;
      expect(dataAccount.tier).toBeDefined();
    });

    it('handles missing --token value gracefully', () => {
      const dataTokenInfo = getMockData('research token info', ['--token']) as any;
      expect(dataTokenInfo.symbol).toBe('ETH');

      const dataTokenIndicators = getMockData('research token indicators', ['--token']) as any;
      expect(dataTokenIndicators.nansen_score).toBeDefined();

      const dataTokenOhlcv = getMockData('research token ohlcv', ['--token']) as any[];
      expect(dataTokenOhlcv[0].close).toBeDefined();
    });
    it('handles token info edge cases (unknown token)', () => {
      const dataUnknown = getMockData('research token info', ['--token', 'UNKNOWN-SYMBOL']) as any;
      expect(dataUnknown.symbol).toBe('ETH');

      // Address mapping fallback
      const dataAddr = getMockData('research token info', ['--token', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']) as any;
      expect(dataAddr.symbol).toBe('ETH');

      // Substring mapping fallback
      const dataSub = getMockData('research token info', ['--token', 'UNISW']) as any;
      expect(dataSub.symbol).toBe('UNI');
    });

    it('handles generatePerps optional chaining fallback', () => {
      // Perps generates for SUI and INJ, which don't exist in TOKEN_DATA so it falls back
      const data = getMockData('research perp screener') as any[];
      const sui = data.find(d => d.symbol === 'SUI');
      expect(sui.price).toBeDefined();
    });

    it('handles chained fallbacks for profit calculation and balance', () => {
      const balance = getMockData('research profiler balance') as any[];
      expect(balance[0].value_usd).toBeGreaterThanOrEqual(0);

      const pnlSum = getMockData('research profiler pnl-summary') as any;
      expect(pnlSum.total_realized_pnl_usd).toBeDefined();

      const smHoldings = getMockData('research smart-money holdings') as any[];
      expect(smHoldings[0].token_symbol).toBeDefined();
    });
  });
});
