import { execFile, spawn } from 'node:child_process';
import type { NansenResponse } from '../types/nansen.js';
import { IS_MOCK, getMockData } from './mock.js';

/**
 * Execute a nansen CLI command and parse the JSON output.
 */
export function execNansen<T = unknown>(
  command: string,
  args: string[] = [],
): Promise<NansenResponse<T>> {
  if (IS_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mock = getMockData(command);
        if (mock !== null) {
          resolve({ success: true, data: mock as T });
        } else {
          resolve({ success: false, error: '[MOCK] No data for: ' + command });
        }
      }, 300);
    });
  }

  return new Promise((resolve) => {
    const fullArgs = [...command.split(' '), ...args, '--pretty'];

    execFile('nansen', fullArgs, { maxBuffer: 10 * 1024 * 1024, timeout: 30_000 }, (error, stdout, stderr) => {
      if (error) {
        // Try to parse error output as JSON
        const errorText = stderr || stdout || error.message;
        try {
          const parsed = JSON.parse(errorText);
          resolve({
            success: false,
            error: parsed.error || error.message,
            code: parsed.code,
            status: parsed.status,
          });
        } catch {
          resolve({
            success: false,
            error: errorText,
            code: 'EXEC_ERROR',
          });
        }
        return;
      }

      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed as NansenResponse<T>);
      } catch {
        resolve({
          success: false,
          error: `Failed to parse JSON: ${stdout.slice(0, 200)}`,
          code: 'PARSE_ERROR',
        });
      }
    });
  });
}

/**
 * Track API call count globally.
 */
let apiCallCount = 0;

export function getApiCallCount(): number {
  return apiCallCount;
}

export function incrementApiCallCount(): void {
  apiCallCount++;
}

export function resetApiCallCount(): void {
  apiCallCount = 0;
}

/**
 * Convenience wrappers for common Nansen CLI commands.
 */
export async function fetchNetflow(chain: string, limit = 10) {
  incrementApiCallCount();
  return execNansen('research smart-money netflow', [
    '--chain', chain,
    '--limit', String(limit),
  ]);
}

export async function fetchDexTrades(chain: string, limit = 10) {
  incrementApiCallCount();
  return execNansen('research smart-money dex-trades', [
    '--chain', chain,
    '--limit', String(limit),
  ]);
}

export async function fetchPerpScreener(limit = 10) {
  incrementApiCallCount();
  return execNansen('research perp screener', [
    '--limit', String(limit),
  ]);
}

export async function fetchWalletList() {
  incrementApiCallCount();
  return execNansen('wallet list');
}

export async function fetchWalletShow(name: string) {
  incrementApiCallCount();
  return execNansen('wallet show', ['--name', name]);
}

export async function fetchBalance(address: string, chain: string) {
  incrementApiCallCount();
  return execNansen('research profiler balance', [
    '--address', address,
    '--chain', chain,
  ]);
}

export async function fetchTokenInfo(chain: string, token: string) {
  incrementApiCallCount();
  return execNansen('research token info', [
    '--chain', chain,
    '--token', token,
  ]);
}

export async function fetchTokenIndicators(chain: string, token: string) {
  incrementApiCallCount();
  return execNansen('research token indicators', [
    '--chain', chain,
    '--token', token,
  ]);
}

export async function fetchTokenOHLCV(chain: string, token: string) {
  incrementApiCallCount();
  return execNansen('research token ohlcv', [
    '--chain', chain,
    '--token', token,
    '--timeframe', '1h',
  ]);
}

export async function fetchTradeQuote(
  chain: string,
  from: string,
  to: string,
  amount: string,
  wallet?: string,
) {
  incrementApiCallCount();
  const args = ['--chain', chain, '--from', from, '--to', to, '--amount', amount];
  if (wallet) args.push('--wallet', wallet);
  return execNansen('trade quote', args);
}

export async function fetchSearch(query: string) {
  incrementApiCallCount();
  return execNansen('research search', ['--query', query]);
}

export async function fetchAccountStatus() {
  incrementApiCallCount();
  return execNansen('account');
}

export async function fetchSmartMoneyHoldings(chain: string, limit = 10) {
  incrementApiCallCount();
  return execNansen('research smart-money holdings', [
    '--chain', chain,
    '--limit', String(limit),
  ]);
}

export async function fetchPerpLeaderboard(limit = 10) {
  incrementApiCallCount();
  return execNansen('research perp leaderboard', [
    '--limit', String(limit),
  ]);
}

export async function fetchPnlSummary(address: string, chain: string) {
  incrementApiCallCount();
  return execNansen('research profiler pnl-summary', [
    '--address', address,
    '--chain', chain,
  ]);
}

export async function fetchFlowIntelligence(chain: string, token: string) {
  incrementApiCallCount();
  return execNansen('research token flow-intelligence', [
    '--chain', chain,
    '--token', token,
  ]);
}

/**
 * Spawn a nansen CLI command for NDJSON streaming.
 * Returns a ChildProcess whose stdout emits line-by-line JSON.
 */
export function spawnNansenStream(command: string, args: string[] = []) {
  const fullArgs = [...command.split(' '), ...args, '--stream'];
  return spawn('nansen', fullArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
}
