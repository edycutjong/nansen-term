
import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import PerpPane from '../PerpPane.js';
import { useNansen } from '../../hooks/useNansen.js';

vi.mock('../../hooks/useNansen.js');

describe('PerpPane', () => {
  it('renders loading state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<PerpPane isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('Loading...');
  });

  it('renders error state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to fetch perp data',
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<PerpPane isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('Failed to fetch perp data');
  });

  it('renders data and calls onHighlight', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: {
        rows: [
          { symbol: 'BTC', funding_rate: 0.01, oi_change_24h: 1000000 },
          { symbol: 'ETH', fundingRate: -0.05, oiChange24h: -500000 },
          { }, // missing fields
        ],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    const { lastFrame } = render(<PerpPane isActive={true} selectedIndex={1} onHighlight={onHighlight} />);
    const frame = lastFrame();
    
    expect(frame).toContain('BTC');
    expect(frame).toContain('0.010%');
    expect(frame).toContain('+$1.0M');
    
    expect(frame).toContain('ETH');
    expect(frame).toContain('-0.050%');
    expect(frame).toContain('-$500.0K');
    
    expect(frame).toContain('—'); // symbol fallback
    expect(frame).toContain('0.000%'); // funding fallback
    expect(frame).toContain('$0.00'); // oi fallback

    await new Promise(r => setTimeout(r, 0));
    // Should highlight ETH symbol because selectedIndex=1
    expect(onHighlight).toHaveBeenCalledWith('ETH', 'perp');
  });

  it('renders raw array data', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [
        { symbol: 'SOL', funding_rate: 0.05 },
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<PerpPane isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    
    expect(frame).toContain('SOL');
    expect(frame).toContain('0.050%');
  });

  it('clears highlight if selectedIndex is out of bounds', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [{ symbol: 'UNI' }],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<PerpPane isActive={true} selectedIndex={5} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).toHaveBeenCalledWith(null, 'perp');
  });

  it('does not call onHighlight if not active', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [{ symbol: 'UNI' }],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<PerpPane isActive={false} selectedIndex={0} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).not.toHaveBeenCalled();
  });
  
  it('parses fallback data form', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: {
        data: [{ symbol: 'INJ', funding_rate: 0.08 }],
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<PerpPane isActive={false} selectedIndex={0} />);
    const frame = lastFrame();
    
    expect(frame).toContain('INJ');
  });
});
