import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as child_process from 'node:child_process';
import {
  execNansen,
  getApiCallCount,
  incrementApiCallCount,
  resetApiCallCount,
  spawnNansenStream,
  fetchNetflow,
  fetchDexTrades,
  fetchPerpScreener,
  fetchWalletList,
  fetchWalletShow,
  fetchBalance,
  fetchTokenInfo,
  fetchTokenIndicators,
  fetchTokenOHLCV,
  fetchTradeQuote,
  fetchSearch,
  fetchAccountStatus,
  fetchSmartMoneyHoldings,
  fetchPerpLeaderboard,
  fetchPnlSummary,
  fetchFlowIntelligence,
} from '../nansen.js';
import * as mockModule from '../mock.js';

vi.mock('node:child_process', () => ({
  execFile: vi.fn(),
  spawn: vi.fn(),
}));

describe('nansen', () => {
  beforeEach(() => {
    resetApiCallCount();
    vi.clearAllMocks();
  });

  describe('API call counter', () => {
    it('manages counter correctly', () => {
      expect(getApiCallCount()).toBe(0);
      incrementApiCallCount();
      expect(getApiCallCount()).toBe(1);
      resetApiCallCount();
      expect(getApiCallCount()).toBe(0);
    });
  });

  describe('execNansen', () => {
    it('returns mock data when IS_MOCK is true', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(true);
      
      const res = await execNansen('wallet list');
      expect(res.success).toBe(true);
      expect((res as any).data.wallets).toBeDefined();

      const resFail = await execNansen('unknown test');
      expect(resFail.success).toBe(false);
    });

    it('handles successful API execution in real mode', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(false);
      (child_process.execFile as any).mockImplementation((_cmd: string, _args: any, _opts: any, cb: any) => {
        cb(null, JSON.stringify({ data: { test: true } }), '');
      });

      const res = await execNansen('research some data');
      expect(res).toEqual({ data: { test: true } });
      
      // Also verify args structure
      expect(child_process.execFile).toHaveBeenCalledWith(
        'nansen',
        ['research', 'some', 'data', '--pretty'],
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('handles exec JSON error gracefully from stderr', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(false);
      (child_process.execFile as any).mockImplementation((_cmd: string, _args: any, _opts: any, cb: any) => {
        cb(new Error('Process failed'), '', JSON.stringify({ error: 'Nansen error', code: 'E123', status: 400 }));
      });

      const res = await execNansen('wallet list');
      expect(res).toEqual({ success: false, error: 'Nansen error', code: 'E123', status: 400 });
    });

    it('handles exec JSON error gracefully from stdout', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(false);
      (child_process.execFile as any).mockImplementation((_cmd: string, _args: any, _opts: any, cb: any) => {
        cb(new Error('Process failed'), JSON.stringify({ code: 'E123', status: 400 }), '');
      });

      const res = await execNansen('wallet list');
      expect(res).toEqual({ success: false, error: 'Process failed', code: 'E123', status: 400 }); // parsed.error is undefined, falls back to error.message
    });

    it('handles exec JSON error gracefully from error.message', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(false);
      (child_process.execFile as any).mockImplementation((_cmd: string, _args: any, _opts: any, cb: any) => {
        const error = new Error(JSON.stringify({ error: 'Message JSON', code: 'E456', status: 500 }));
        cb(error, '', '');
      });

      const res = await execNansen('wallet list');
      expect(res).toEqual({ success: false, error: 'Message JSON', code: 'E456', status: 500 });
    });

    it('handles exec generic error gracefully', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(false);
      (child_process.execFile as any).mockImplementation((_cmd: string, _args: any, _opts: any, cb: any) => {
        cb(new Error('Process failed'), '', 'Not JSON stderr payload');
      });

      const res = await execNansen('wallet list');
      expect(res).toEqual({
        success: false,
        error: 'Not JSON stderr payload',
        code: 'EXEC_ERROR',
      });
    });

    it('handles parse error gracefully on stdout', async () => {
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(false);
      (child_process.execFile as any).mockImplementation((_cmd: string, _args: any, _opts: any, cb: any) => {
        cb(null, 'Invalid JSON Response', '');
      });

      const res = await execNansen('wallet list');
      expect(res.success).toBe(false);
      expect((res as any).code).toBe('PARSE_ERROR');
    });
  });

  describe('fetch wrappers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(mockModule, 'IS_MOCK', 'get').mockReturnValue(true);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls incrementApiCallCount and returns data', async () => {
      const p1 = fetchNetflow('ethereum');
      const p2 = fetchDexTrades('base');
      const p3 = fetchPerpScreener();
      const p4 = fetchWalletList();
      const p5 = fetchWalletShow('demo1');
      const p6 = fetchBalance('0xabc', 'ethereum');
      const p7 = fetchTokenInfo('ethereum', 'ETH');
      const p8 = fetchTokenIndicators('ethereum', 'ETH');
      const p9 = fetchTokenOHLCV('ethereum', 'ETH');
      const p10 = fetchTradeQuote('ethereum', 'ETH', 'USDC', '1.0');
      const p11 = fetchTradeQuote('ethereum', 'ETH', 'USDC', '1.0', 'demo-wallet'); // with wallet
      const p12 = fetchSearch('Ethereum');
      const p13 = fetchAccountStatus();
      const p14 = fetchSmartMoneyHoldings('ethereum');
      const p15 = fetchPerpLeaderboard();
      const p16 = fetchPnlSummary('0xabc', 'ethereum');
      const p17 = fetchFlowIntelligence('ethereum', 'ETH');

      vi.runAllTimers();

      await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17]);

      // 17 calls made (2 for fetchTradeQuote)
      expect(getApiCallCount()).toBe(17);
    });
  });

  describe('spawnNansenStream', () => {
    it('should spawn a child process with --stream', () => {
      spawnNansenStream('research dex-trades', ['--chain', 'ethereum']);
      expect(child_process.spawn).toHaveBeenCalledWith(
        'nansen',
        ['research', 'dex-trades', '--chain', 'ethereum', '--stream'],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
    });

    it('should spawn a child process with no args', () => {
      spawnNansenStream('research dex-trades');
      expect(child_process.spawn).toHaveBeenCalledWith(
        'nansen',
        ['research', 'dex-trades', '--stream'],
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );
    });
  });
});
