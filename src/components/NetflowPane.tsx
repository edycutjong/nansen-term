import React from 'react';
import { Text } from 'ink';
import Pane from './Pane.js';
import Table from './Table.js';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface NetflowPaneProps {
  chain: Chain;
  isActive: boolean;
  selectedIndex: number;
}

const COLUMNS = [
  { header: 'Token', key: 'token', width: 10, align: 'left' as const },
  { header: '24h Flow', key: 'flow24h', width: 12, align: 'right' as const },
  { header: '7d Flow', key: 'flow7d', width: 12, align: 'right' as const },
];

export default function NetflowPane({ chain, isActive, selectedIndex }: NetflowPaneProps) {
  const { data, loading, error } = useNansen(
    'research smart-money netflow',
    ['--chain', chain, '--limit', '10'],
  );

  if (loading) {
    return (
      <Pane title="Smart Money Netflow" emoji="📊" isActive={isActive} width="50%">
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  if (error) {
    return (
      <Pane title="Smart Money Netflow" emoji="📊" isActive={isActive} width="50%">
        <Text color="red">{error}</Text>
      </Pane>
    );
  }

  // Parse the data — the actual structure depends on the Nansen API response
  const entries = Array.isArray(data) ? data : (data as Record<string, unknown>)?.rows ?? (data as Record<string, unknown>)?.data ?? [];
  const rows = (entries as Record<string, unknown>[]).map((entry) => ({
    token: String(entry.token_symbol ?? entry.symbol ?? entry.tokenSymbol ?? '—'),
    flow24h: formatUSD(Number(entry.net_flow_24h_usd ?? entry.netFlow24h ?? entry.net_flow_24h ?? 0)),
    flow7d: formatUSD(Number(entry.net_flow_7d_usd ?? entry.netFlow7d ?? entry.net_flow_7d ?? 0)),
    address: String(entry.token_address ?? entry.tokenAddress ?? ''),
  }));

  return (
    <Pane title="Smart Money Netflow" emoji="📊" isActive={isActive} width="50%">
      <Table columns={COLUMNS} data={rows} maxRows={8} selectedIndex={isActive ? selectedIndex : undefined} />
    </Pane>
  );
}
