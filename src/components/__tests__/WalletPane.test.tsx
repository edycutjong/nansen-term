
import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import WalletPane from '../WalletPane.js';
import { useNansen } from '../../hooks/useNansen.js';

vi.mock('../../hooks/useNansen.js');

describe('WalletPane', () => {
  it('renders loading state initially', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<WalletPane chain="ethereum" walletName={null} isActive={true} />);
    const frame = lastFrame();
    expect(frame).toContain('Loading...');
  });

  it('renders empty wallet list', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<WalletPane chain="ethereum" walletName={null} isActive={true} />);
    const frame = lastFrame();
    expect(frame).toContain('No wallets found.');
    expect(frame).toContain('nansen wallet create');
  });

  it('renders wallet list with selection', () => {
    vi.mocked(useNansen).mockImplementation((command) => {
      if (command === 'wallet list') {
        return {
          data: { wallets: [{ name: 'main' }, { name: 'secondary' }] },
          loading: false,
          error: null,
          refresh: vi.fn(),
        };
      }
      return { data: null, loading: false, error: null, refresh: vi.fn() };
    });

    const { lastFrame } = render(<WalletPane chain="ethereum" walletName={null} isActive={true} selectedIndex={1} height={20} />);
    const frame = lastFrame();
    expect(frame).toContain('main');
    expect(frame).toContain(' ▸ secondary'); // Highlighted
    expect(frame).toContain('[A] Add Wallet');
  });

  it('renders wallet list from raw array', () => {
    vi.mocked(useNansen).mockImplementation((command) => {
      if (command === 'wallet list') {
        return {
          data: [{ name: 'array-wallet' }],
          loading: false,
          error: null,
          refresh: vi.fn(),
        };
      }
      return { data: null, loading: false, error: null, refresh: vi.fn() };
    });

    const { lastFrame } = render(<WalletPane chain="ethereum" walletName={null} isActive={false} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('array-wallet');
  });

  it('renders specific wallet info with loading balances', () => {
    vi.mocked(useNansen).mockImplementation((command) => {
      if (command === 'wallet show') {
        return {
          data: { evm_address: '0x1234567890123456789012345678901234567890', solana_address: 'Sol123456789012345678901234567' },
          loading: false,
          error: null,
          refresh: vi.fn(),
        };
      }
      if (command === 'research profiler balance') {
        return { data: null, loading: true, error: null, refresh: vi.fn() };
      }
      return { data: null, loading: false, error: null, refresh: vi.fn() };
    });

    const { lastFrame } = render(<WalletPane chain="ethereum" walletName="main" isActive={true} />);
    const frame = lastFrame();
    expect(frame).toContain('Name: ');
    expect(frame).toContain('main');
    expect(frame).toContain('Loading balances...');
  });

  it('renders specific wallet info with balances', () => {
    vi.mocked(useNansen).mockImplementation((command) => {
      if (command === 'wallet show') {
        return {
          data: { evmAddress: '0x123', solanaAddress: 'Sol1' },
          loading: false,
          error: null,
          refresh: vi.fn(),
        };
      }
      if (command === 'research profiler balance') {
        return {
          data: [
            { token_symbol: 'ETH', balance: 1.5, value_usd: 3000 },
            { symbol: 'USDC', amount: 100.5, usd_value: 100.5 },
            { symbol: 'SHIB', amount: 0.005, usd_value: 0.1 },
          ],
          loading: false,
          error: null,
          refresh: vi.fn(),
        };
      }
      return { data: null, loading: false, error: null, refresh: vi.fn() };
    });

    const { lastFrame } = render(<WalletPane chain="ethereum" walletName="main" isActive={true} height={20} />);
    const frame = lastFrame();
    expect(frame).toContain('ETH ');
    expect(frame).toContain('1.50');
    expect(frame).toContain('(+$3.0K)');
    expect(frame).toContain('USDC');
    expect(frame).toContain('100.50');
    expect(frame).toContain('(+$100.50)');
    expect(frame).toContain('SHIB');
    expect(frame).toContain('0.005000');
    expect(frame).toContain('(+$0.1000)');
  });

  it('renders specific wallet info without balances (shows addresses)', () => {
    vi.mocked(useNansen).mockImplementation((command) => {
      if (command === 'wallet show') {
        return {
          data: { address: '0xShort', solana_address: 'SolVeryLongAddressThatExceedsTwentyChars' },
          loading: false,
          error: 'Some wallet error',
          refresh: vi.fn(),
        };
      }
      if (command === 'research profiler balance') {
        return { data: [], loading: false, error: null, refresh: vi.fn() };
      }
      return { data: null, loading: false, error: null, refresh: vi.fn() };
    });

    const { lastFrame } = render(<WalletPane chain="solana" walletName="main" isActive={true} />);
    const frame = lastFrame();
    expect(frame).toContain('EVM:');
    expect(frame).toContain('0xShort');
    expect(frame).toContain('SOL:');
    expect(frame).toContain('SolVer…hars'); // Truncated
    expect(frame).toContain('Some wallet error');
  });
  
  it('renders specific wallet info with fallback addresses', () => {
    vi.mocked(useNansen).mockImplementation((command) => {
      if (command === 'wallet show') {
        return {
          data: {},
          loading: false,
          error: null,
          refresh: vi.fn(),
        };
      }
      return { data: null, loading: false, error: null, refresh: vi.fn() };
    });

    const { lastFrame } = render(<WalletPane chain="solana" walletName="main" isActive={true} />);
    const frame = lastFrame();
    expect(frame).toContain('EVM:');
    expect(frame).toContain('—');
    expect(frame).toContain('SOL:');
    expect(frame).toContain('—');
  });
});
