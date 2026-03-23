import React from 'react';
import { Text } from 'ink';
import Pane from './Pane.js';
import Table from './Table.js';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD, formatPercent } from '../lib/formatter.js';
import type { PaneId } from '../types/nansen.js';

interface PerpPaneProps {
  isActive: boolean;
  selectedIndex: number;
  height?: number;
  refreshTrigger?: number;
  onHighlight?: (token: string | null, pane: PaneId) => void;
}

const COLUMNS = [
  { header: 'Symbol', key: 'symbol', width: 8, align: 'left' as const },
  { header: 'Funding', key: 'funding', width: 10, align: 'right' as const },
  { header: 'OI Change', key: 'oiChange', width: 12, align: 'right' as const },
];

export default function PerpPane({ isActive, selectedIndex, height, refreshTrigger = 0, onHighlight }: PerpPaneProps) {
  const { data, loading, error } = useNansen(
    'research perp screener',
    ['--limit', '10'],
    true,
    refreshTrigger,
  );
  const entries = Array.isArray(data) ? data : (data as Record<string, unknown>)?.rows ?? (data as Record<string, unknown>)?.data ?? [];
  const rows = (entries as Record<string, unknown>[]).map((entry) => ({
    symbol: String(entry.symbol ?? '—'),
    funding: formatPercent(Number(entry.funding_rate ?? entry.fundingRate ?? 0)),
    oiChange: formatUSD(Number(entry.oi_change_24h ?? entry.oiChange24h ?? 0)),
  }));

  React.useEffect(() => {
    if (isActive && onHighlight) {
      if (selectedIndex !== undefined && selectedIndex >= 0 && selectedIndex < rows.length) {
        onHighlight(rows[selectedIndex]?.symbol || null, 'perp');
      } else {
        onHighlight(null, 'perp');
      }
    }
  }, [isActive, selectedIndex, rows, onHighlight]);
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

  return (
    <Pane title="Perp Screener" emoji="📈" isActive={isActive} width="50%" height={height}>
      <Table columns={COLUMNS} data={rows} maxRows={8} selectedIndex={isActive ? selectedIndex : undefined} />
    </Pane>
  );
}
