import React from 'react';
import { Box, Text } from 'ink';

interface Column {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'right';
  color?: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, string | number | undefined | null>[];
  maxRows?: number;
  selectedIndex?: number;
}

export default function Table({ columns, data, maxRows, selectedIndex }: TableProps) {
  const rows = maxRows ? data.slice(0, maxRows) : data;

  return (
    <Box flexDirection="column">
      {/* Header row */}
      <Box>
        {columns.map((col, i) => (
          <Box key={i} width={col.width}>
            <Text color="gray" dimColor bold>
              {col.align === 'right'
                ? String(col.header).padStart(col.width - 1)
                : String(col.header).padEnd(col.width - 1)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Separator */}
      <Box>
        {columns.map((col, i) => (
          <Box key={i} width={col.width}>
            <Text color="gray" dimColor>{'─'.repeat(col.width - 1)}</Text>
          </Box>
        ))}
      </Box>

      {/* Data rows */}
      {rows.length === 0 ? (
        <Text color="gray">No data available</Text>
      ) : (
        rows.map((row, rowIdx) => (
          <Box key={rowIdx}>
            {columns.map((col, colIdx) => {
              const value = String(row[col.key] ?? '—');
              const isSelected = selectedIndex === rowIdx;
              const textColor = isSelected
                ? 'cyan'
                : col.color
                  ? col.color
                  : 'white';

              return (
                <Box key={colIdx} width={col.width}>
                  <Text color={textColor} bold={isSelected} inverse={isSelected}>
                    {col.align === 'right'
                      ? value.padStart(col.width - 1)
                      : value.padEnd(col.width - 1)}
                  </Text>
                </Box>
              );
            })}
          </Box>
        ))
      )}
    </Box>
  );
}
