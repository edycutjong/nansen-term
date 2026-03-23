import React from 'react';
import { Text } from 'ink';
import Pane from './Pane.js';
import Table from './Table.js';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD, formatTime } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface DexTradesPaneProps {
  chain: Chain;
  isActive: boolean;
  selectedIndex: number;
}

const COLUMNS = [
  { header: 'Time', key: 'time', width: 8, align: 'left' as const },
  { header: 'Swap', key: 'swap', width: 20, align: 'left' as const },
  { header: 'Value', key: 'value', width: 12, align: 'right' as const },
];

export default function DexTradesPane({ chain, isActive, selectedIndex }: DexTradesPaneProps) {
  const { data, loading, error } = useNansen(
    'research smart-money dex-trades',
    ['--chain', chain, '--limit', '10'],
  );

  if (loading) {
    return (
      <Pane title="DEX Trades (Live)" emoji="🔄" isActive={isActive} width="50%">
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  if (error) {
    return (
      <Pane title="DEX Trades (Live)" emoji="🔄" isActive={isActive} width="50%">
        <Text color="red">{error}</Text>
      </Pane>
    );
  }

  const entries = Array.isArray(data) ? data : (data as Record<string, unknown>)?.rows ?? (data as Record<string, unknown>)?.data ?? [];
  const rows = (entries as Record<string, unknown>[]).map((entry) => {
    const buyToken = String(entry.buyer_token_symbol ?? entry.buyerTokenSymbol ?? entry.token_bought ?? '?');
    const sellToken = String(entry.seller_token_symbol ?? entry.sellerTokenSymbol ?? entry.token_sold ?? '?');
    return {
      time: formatTime(String(entry.timestamp ?? entry.time ?? entry.block_time ?? '')),
      swap: `${buyToken}→${sellToken}`,
      value: formatUSD(Number(entry.value_usd ?? entry.valueUsd ?? entry.trade_value_usd ?? 0)),
    };
  });

  return (
    <Pane title="DEX Trades (Live)" emoji="🔄" isActive={isActive} width="50%">
      <Table columns={COLUMNS} data={rows} maxRows={8} selectedIndex={isActive ? selectedIndex : undefined} />
    </Pane>
  );
}
