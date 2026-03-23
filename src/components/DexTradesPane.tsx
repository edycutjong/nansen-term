import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import Pane from './Pane.js';
import Table from './Table.js';
import { useNansen } from '../hooks/useNansen.js';
import { useStream } from '../hooks/useStream.js';
import { formatUSD, formatTime } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface DexTradesPaneProps {
  chain: Chain;
  isActive: boolean;
  selectedIndex: number;
  isStreaming?: boolean;
  height?: number;
  refreshTrigger?: number;
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

export default function DexTradesPane({ chain, isActive, selectedIndex, isStreaming = false, height, refreshTrigger = 0 }: DexTradesPaneProps) {
  const { data, loading: snapLoading, error: snapError } = useNansen(
    'research smart-money dex-trades',
    ['--chain', chain, '--limit', '10'],
    !isStreaming,
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

  let rows;
  if (isStreaming) {
    rows = items.map(parseEntry);
  } else {
    const entries = Array.isArray(data) ? data : (data as Record<string, unknown>)?.rows ?? (data as Record<string, unknown>)?.data ?? [];
    rows = (entries as Record<string, unknown>[]).map(parseEntry);
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
