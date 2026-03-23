import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import TokenDetail from '../TokenDetail.js';
import { useNansen } from '../../hooks/useNansen.js';

vi.mock('../../hooks/useNansen.js');

const mockedUseNansen = vi.mocked(useNansen);

describe('TokenDetail', () => {
  it('renders loading state when data is fetching', () => {
    mockedUseNansen.mockReturnValue({
      data: null,
      error: null,
      loading: true,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<TokenDetail chain="ethereum" tokenAddress="0x123" />);
    const frame = lastFrame();

    expect(frame).toContain("Loading '0x123' data...");
  });

  it('renders properly with partial data', () => {
    mockedUseNansen.mockImplementation((command: string) => {
      if (command === 'research token info') {
        return {
          data: {
            name: 'Test Token',
            symbol: 'TEST',
            price_usd: '1.23',
            price_change_24h: '5.5',
            market_cap: '1000000',
            volume_24h: '50000',
          },
          error: null,
          loading: false,
          refresh: vi.fn(),
        };
      }
      if (command === 'research token indicators') {
        return {
          data: {
            nansen_score: '85',
            smart_money_score: '92',
          },
          error: null,
          loading: false,
          refresh: vi.fn(),
        };
      }
      return { data: null, error: null, loading: false, refresh: vi.fn() };
    });

    const { lastFrame } = render(<TokenDetail chain="ethereum" tokenAddress="0x123" />);
    const frame = lastFrame();

    expect(frame).toContain('Test Token');
    expect(frame).toContain('TEST');
    expect(frame).toContain('+$1.23'); // formatUSD
    expect(frame).toContain('+5.500%'); // formatPercent
    expect(frame).toContain('85'); // score
    expect(frame).toContain('92'); // score
  });

  it('handles negative price changes', () => {
    mockedUseNansen.mockImplementation((command: string) => {
      if (command === 'research token info') {
        return {
          data: {
            name: 'Negative Token',
            symbol: 'NEG',
            price: '1.23',
            priceChange24h: '-5.5', // testing fallback property names
            marketCap: '1000000',
            volume24h: '50000',
          },
          error: null,
          loading: false,
          refresh: vi.fn(),
        };
      }
      if (command === 'research token indicators') {
        return {
          data: {
            nansenScore: '85',
            smartMoneyScore: '92',
          },
          error: null,
          loading: false,
          refresh: vi.fn(),
        };
      }
      return { data: null, error: null, loading: false, refresh: vi.fn() };
    });

    const { lastFrame } = render(<TokenDetail chain="ethereum" tokenAddress="0x123456789012345678901234567890" />);
    const frame = lastFrame();

    expect(frame).toContain('Negative Token');
    expect(frame).toContain('NEG');
    expect(frame).toContain('-5.500%'); // formatPercent
    expect(frame).toContain('0x123456…567890'); // address truncation
  });

  it('renders fallbacks for missing/empty data', () => {
    mockedUseNansen.mockReturnValue({
      data: null, // this will be cast to {} and trigger fallbacks
      error: null,
      loading: false,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<TokenDetail chain="ethereum" tokenAddress="0x123" />);
    const frame = lastFrame();

    expect(frame).toContain('Name:     —');
    expect(frame).toContain('Symbol:   —');
    expect(frame).toContain('Price:       $0.00');
    expect(frame).toContain('24h Change:  0.000%');
    expect(frame).toContain('Market Cap:  $0.00');
    expect(frame).toContain('Nansen: 0.00');
    expect(frame).toContain('| SM: 0.00');
  });

  it('shows red color for negative price_change_24h', () => {
    mockedUseNansen.mockImplementation((command: string) => {
      if (command === 'research token info') {
        return {
          data: {
            name: 'Red Token',
            symbol: 'RED',
            price_usd: '0.50',
            price_change_24h: '-12.3',
            market_cap: '500000',
            volume_24h: '10000',
          },
          error: null,
          loading: false,
          refresh: vi.fn(),
        };
      }
      return { data: null, error: null, loading: false, refresh: vi.fn() };
    });

    const { lastFrame } = render(<TokenDetail chain="ethereum" tokenAddress="0xabc" />);
    const frame = lastFrame();

    expect(frame).toContain('Red Token');
    expect(frame).toContain('-12.300%');
  });
});

