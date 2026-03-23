import { useEffect } from 'react';
import { Box, Text } from 'ink';
import Pane from './Pane.js';
import Table from './Table.js';
import { useNansen } from '../hooks/useNansen.js';
import { useStream } from '../hooks/useStream.js';
import { formatUSD, formatTime } from '../lib/formatter.js';
import type { Chain, PaneId } from '../types/nansen.js';

interface DexTradesPaneProps {
  chain: Chain;
  isActive: boolean;
  selectedIndex: number;
  isStreaming?: boolean;
  height?: number;
  refreshTrigger?: number;
  onHighlight?: (token: string | null, pane: PaneId) => void;
}

const COLUMNS = [
  { header: 'Time', key: 'time', width: 8, align: 'left' as const },
  { header: 'Swap', key: 'swap', width: 20, align: 'left' as const },
  { header: 'Value', key: 'value', width: 12, align: 'right' as const },
];

function parseEntry(entry: Record<string, unknown>) {
  const buyToken = String(entry.buyer_token_symbol ?? entry.buyerTokenSymbol ?? entry.token_bought ?? '?');
  const sellToken = String(entry.seller_token_symbol ?? entry.sellerTokenSymbol ?? entry.token_sold ?? '?');
  return {
    time: formatTime(String(entry.timestamp ?? entry.time ?? entry.block_time ?? '')),
    swap: `${buyToken}→${sellToken}`,
    value: formatUSD(Number(entry.value_usd ?? entry.valueUsd ?? entry.trade_value_usd ?? 0)),
  };
}

export default function DexTradesPane({ chain, isActive, selectedIndex, isStreaming = false, height, refreshTrigger = 0, onHighlight }: DexTradesPaneProps) {
  const { data, loading: snapLoading, error: snapError } = useNansen(
    'research smart-money dex-trades',
    ['--chain', chain, '--limit', '10'],
    true,
    refreshTrigger,
  );

  // Streaming mode
  const { items, isStreaming: streamActive, error: streamError, start, stop } = useStream<Record<string, unknown>>(
    'research smart-money dex-trades',
    ['--chain', chain],
  );

  useEffect(() => {
    if (isStreaming) {
      start();
    } else {
      stop();
    }
  }, [isStreaming, chain]);

  // Parse snapshot rows
  const snapRows: ReturnType<typeof parseEntry>[] = (() => {
    if (snapLoading || snapError) return [];
    const entries = Array.isArray(data) ? data : (data as Record<string, unknown>)?.rows ?? (data as Record<string, unknown>)?.data ?? [];
    return (entries as Record<string, unknown>[]).map(parseEntry);
  })();

  // Compute final rows: streaming items on top, then snapshot as seed
  let rows: ReturnType<typeof parseEntry>[] = [];
  if (isStreaming) {
    const streamRows = items.map(parseEntry);
    // Show stream items first, then snapshot fills the gap
    rows = [...streamRows, ...snapRows].slice(0, 20);
  } else {
    rows = snapRows;
  }

  // Extract buyer token from swap string for token detail
  useEffect(() => {
    if (isActive && onHighlight) {
      if (selectedIndex >= 0 && selectedIndex < rows.length) {
        const swap = rows[selectedIndex]!.swap;
        const buyerToken = swap.split('→')[0]!.trim();
        onHighlight(buyerToken, 'dex-trades');
      } else {
        onHighlight(null, 'dex-trades');
      }
    }
  }, [isActive, selectedIndex, rows.length, onHighlight]);

  const modeLabel = streamActive ? '● LIVE' : '(Snapshot)';
  const title = `DEX Trades ${modeLabel}`;

  if (!isStreaming && snapLoading) {
    return (
      <Pane title={title} emoji="🔄" isActive={isActive} width="50%" height={height}>
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  const error = snapError ?? streamError;
  if (error) {
    return (
      <Pane title={title} emoji="🔄" isActive={isActive} width="50%" height={height}>
        <Text color="red">{error}</Text>
      </Pane>
    );
  }

  return (
    <Pane title={title} emoji="🔄" isActive={isActive} width="50%" height={height}>
      {isStreaming && (
        <Box marginBottom={1}>
          <Text color="magenta">● {rows.length} trades  </Text>
          <Text color="gray">[S] stop streaming</Text>
        </Box>
      )}
      <Table columns={COLUMNS} data={rows} maxRows={7} selectedIndex={isActive ? selectedIndex : undefined} />
    </Pane>
  );
}
