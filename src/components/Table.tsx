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
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // Calculate the visible window based on selectedIndex
  let scrollOffset = 0;
  let visibleCount = maxRows ?? data.length;

  if (selectedIndex !== undefined && maxRows && data.length > maxRows) {
    // First pass: compute raw offset to decide which indicators are needed
    const rawOffset = Math.max(0, Math.min(selectedIndex - maxRows + 1, data.length - maxRows));
    const willShowAbove = rawOffset > 0;
    const willShowBelow = rawOffset + maxRows < data.length;

    // Reduce visible rows to make room for indicators (1 row each)
    const indicatorCount = (willShowAbove ? 1 : 0) + (willShowBelow ? 1 : 0);
    visibleCount = maxRows - indicatorCount;

    // Recalculate offset with adjusted visible count
    scrollOffset = Math.max(0, Math.min(selectedIndex - visibleCount + 1, data.length - visibleCount));
  }

  const rows = data.slice(scrollOffset, scrollOffset + visibleCount);
  const hasMore = scrollOffset + visibleCount < data.length;
  const hasAbove = scrollOffset > 0;

  return (
    <Box flexDirection="column">
      {/* Scroll up indicator */}
      {hasAbove ? (
        <Box justifyContent="center" width={totalWidth}>
          <Text color="gray" dimColor>▲ {scrollOffset} more</Text>
        </Box>
      ) : null}

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
        rows.map((row, rowIdx) => {
          const actualIdx = scrollOffset + rowIdx;
          return (
            <Box key={rowIdx}>
              {columns.map((col, colIdx) => {
                const value = String(row[col.key] ?? '—');
                const isSelected = selectedIndex === actualIdx;
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
          );
        })
      )}

      {/* Scroll down indicator */}
      {hasMore ? (
        <Box justifyContent="center" width={totalWidth}>
          <Text color="gray" dimColor>▼ {data.length - scrollOffset - visibleCount} more</Text>
        </Box>
      ) : null}
    </Box>
  );
}
