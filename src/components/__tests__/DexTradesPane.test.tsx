import React from 'react';
import { render } from 'ink-testing-library';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DexTradesPane from '../DexTradesPane.js';
import { useNansen } from '../../hooks/useNansen.js';
import { useStream } from '../../hooks/useStream.js';

vi.mock('../../hooks/useNansen.js');
vi.mock('../../hooks/useStream.js');

describe('DexTradesPane', () => {
  beforeEach(() => {
    vi.mocked(useStream).mockReturnValue({
      items: [],
      isStreaming: false,
      error: null,
      start: vi.fn(),
      stop: vi.fn(),
    });
  });

  it('renders loading state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('Loading...');
  });

  it('renders error state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: false,
      error: 'Snapshot error',
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('Snapshot error');
  });

  it('renders stream error state', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    vi.mocked(useStream).mockReturnValue({
      items: [],
      isStreaming: true,
      error: 'Stream error',
      start: vi.fn(),
      stop: vi.fn(),
    });

    const { lastFrame } = render(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={0} isStreaming={true} />);
    const frame = lastFrame();
    expect(frame).toContain('Stream error');
  });

  it('renders snapshot data and calls onHighlight', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [
        { buyer_token_symbol: 'ETH', seller_token_symbol: 'USDC', timestamp: '1600000000', value_usd: 1234.5 },
        { token_bought: 'WETH', token_sold: 'DAI', time: '1600000001', valueUsd: 567.8 }, // fallback names
        { buyerTokenSymbol: 'PEPE', sellerTokenSymbol: 'wBTC', block_time: '1600000002', trade_value_usd: 99.9 }, // fallback names
        { timestamp: '1600000003' } // fallback output for missing fields
      ],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    const { lastFrame } = render(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={1} onHighlight={onHighlight} />);
    const frame = lastFrame();
    
    expect(frame).toContain('ETH→USDC');
    expect(frame).toContain('+$1.2K');
    expect(frame).toContain('WETH→DAI');
    expect(frame).toContain('+$567.80');
    expect(frame).toContain('PEPE→wBTC');
    expect(frame).toContain('+$99.90');
    expect(frame).toContain('?→?');
    expect(frame).toContain('$0.00');

    await new Promise(r => setTimeout(r, 0));
    // highlight index 1
    expect(onHighlight).toHaveBeenCalledWith('WETH', 'dex-trades');
  });

  it('starts and stops stream based on prop', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const startMock = vi.fn();
    const stopMock = vi.fn();
    vi.mocked(useStream).mockReturnValue({
      items: [{ token_bought: 'STREAM', token_sold: 'USDC', value_usd: 100 }],
      isStreaming: true,
      error: null,
      start: startMock,
      stop: stopMock,
    });

    const { lastFrame, rerender } = render(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={0} isStreaming={true} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(startMock).toHaveBeenCalled();
    const frame1 = lastFrame();
    expect(frame1).toContain('● LIVE');
    expect(frame1).toContain('STREAM→USDC');

    // Update to not streaming
    rerender(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={0} isStreaming={false} />);
    await new Promise(r => setTimeout(r, 0));
    expect(stopMock).toHaveBeenCalled();
  });

  it('handles empty highlights', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<DexTradesPane chain="ethereum" isActive={true} selectedIndex={0} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).toHaveBeenCalledWith(null, 'dex-trades');
  });

  it('handles non-active highlight', async () => {
    vi.mocked(useNansen).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const onHighlight = vi.fn();
    render(<DexTradesPane chain="ethereum" isActive={false} selectedIndex={0} onHighlight={onHighlight} />);
    
    await new Promise(r => setTimeout(r, 0));
    expect(onHighlight).not.toHaveBeenCalled();
  });
  
  it('parses structured data', () => {
    vi.mocked(useNansen).mockReturnValue({
      data: {
        rows: [{ token_bought: 'SOL', token_sold: 'USDC', value_usd: 100 }]
      },
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { lastFrame } = render(<DexTradesPane chain="solana" isActive={false} selectedIndex={0} />);
    const frame = lastFrame();
    expect(frame).toContain('SOL→USDC');
  });
});
