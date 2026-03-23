import React from 'react';
import { Text } from 'ink';
import Pane from './Pane.js';
import Table from './Table.js';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD, formatPercent } from '../lib/formatter.js';

interface PerpPaneProps {
  isActive: boolean;
  selectedIndex: number;
  height?: number;
}

const COLUMNS = [
  { header: 'Symbol', key: 'symbol', width: 8, align: 'left' as const },
  { header: 'Funding', key: 'funding', width: 10, align: 'right' as const },
  { header: 'OI Change', key: 'oiChange', width: 12, align: 'right' as const },
];

export default function PerpPane({ isActive, selectedIndex, height }: PerpPaneProps) {
  const { data, loading, error } = useNansen(
    'research perp screener',
    ['--limit', '10'],
  );

  if (loading) {
    return (
      <Pane title="Perp Screener" emoji="📈" isActive={isActive} width="50%" height={height}>
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  if (error) {
    return (
      <Pane title="Perp Screener" emoji="📈" isActive={isActive} width="50%" height={height}>
        <Text color="red">{error}</Text>
      </Pane>
    );
  }

  const entries = Array.isArray(data) ? data : (data as Record<string, unknown>)?.rows ?? (data as Record<string, unknown>)?.data ?? [];
  const rows = (entries as Record<string, unknown>[]).map((entry) => ({
    symbol: String(entry.symbol ?? entry.coin ?? '—'),
    funding: formatPercent(Number(entry.funding_rate ?? entry.fundingRate ?? 0)),
    oiChange: formatUSD(Number(entry.oi_change_24h ?? entry.oiChange24h ?? entry.open_interest_change ?? 0)),
  }));

  return (
    <Pane title="Perp Screener" emoji="📈" isActive={isActive} width="50%" height={height}>
      <Table columns={COLUMNS} data={rows} maxRows={8} selectedIndex={isActive ? selectedIndex : undefined} />
    </Pane>
  );
}
