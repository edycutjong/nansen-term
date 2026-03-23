
import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import NetflowPane from '../NetflowPane.js';
import { useNansen } from '../../hooks/useNansen.js';

vi.mock('../../hooks/useNansen.js');

describe('NetflowPane', () => {
  it('renders loading state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<NetflowPane chain="ethereum" isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('Loading...');
  });

  it('renders error state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch netflow',
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<NetflowPane chain="ethereum" isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('Failed to fetch netflow');
  });

  it('renders data and calls onHighlight', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: {
        rows: [
          { token_symbol: 'USDC', net_flow_24h_usd: 1000000, net_flow_7d_usd: 5000000, token_address: '0xa0b8' },
          { symbol: 'ETH', netFlow24h: -500000, netFlow7d: -2000000, tokenAddress: '0xeth' },
          { tokenSymbol: 'PEPE', net_flow_24h: 100, net_flow_7d: 500 }, // No address
        ],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    const { lastFrame } = render(<NetflowPane chain="ethereum" isActive={true} selectedIndex={1} onHighlight={onHighlight} />);
    const frame = lastFrame();
    
    expect(frame).toContain('USDC');
    expect(frame).toContain('+$1.0M');
    expect(frame).toContain('ETH');
    expect(frame).toContain('-$500.0K');
    expect(frame).toContain('PEPE');
    expect(frame).toContain('+$100.00');

    await new Promise(r => setTimeout(r, 0));
    // Should highlight ETH address because selectedIndex=1
    expect(onHighlight).toHaveBeenCalledWith('0xeth', 'netflow');
  });

  it('renders raw array data and highlights token symbol if address missing', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [
        { symbol: 'WBTC', net_flow_24h_usd: 5000 },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<NetflowPane chain="ethereum" isActive={true} selectedIndex={0} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    // Should fallback to token symbol for highlight
    expect(onHighlight).toHaveBeenCalledWith('WBTC', 'netflow');
  });

  it('clears highlight if selectedIndex is out of bounds', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [{ symbol: 'UNI' }],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<NetflowPane chain="ethereum" isActive={true} selectedIndex={5} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).toHaveBeenCalledWith('UNI', 'netflow');
  });

  it('does not call onHighlight if not active', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [{ symbol: 'UNI' }],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<NetflowPane chain="ethereum" isActive={false} selectedIndex={0} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).not.toHaveBeenCalled();
  });
  
  it('parses data fallback format', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: {
        data: [
          { token_symbol: 'DAI', net_flow_24h_usd: 123 },
        ],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<NetflowPane chain="ethereum" isActive={false} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('DAI');
    expect(frame).toContain('$123.00');
  });

  it('highlights address when present', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [
        { token_symbol: 'LINK', net_flow_24h_usd: 100, token_address: '0xLINK' },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<NetflowPane chain="ethereum" isActive={true} selectedIndex={0} onHighlight={onHighlight} />);
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).toHaveBeenCalledWith('0xLINK', 'netflow');
  });
});
