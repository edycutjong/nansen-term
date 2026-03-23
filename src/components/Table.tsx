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
  const needsScroll = maxRows !== undefined && data.length > maxRows;

  // Calculate the visible window
  let scrollOffset = 0;
  // When data exceeds maxRows, always reserve 1 row for the ▼ indicator
  // so the row count stays consistent between selected/unselected states
  let visibleCount = needsScroll ? Math.max(1, maxRows - 1) : (maxRows ?? data.length);

  if (needsScroll && selectedIndex !== undefined && selectedIndex >= 0) {
    // Compute raw scroll position
    scrollOffset = Math.max(0, Math.min(selectedIndex - visibleCount + 1, data.length - visibleCount));

    // If scrolled down, we also need ▲ — steal another row
    if (scrollOffset > 0) {
      visibleCount = maxRows! - 2; // 1 for ▲ + 1 for ▼
      // Recompute offset with updated visible count
      scrollOffset = Math.max(0, Math.min(selectedIndex - visibleCount + 1, data.length - visibleCount));
    }
  }

  const rows = data.slice(scrollOffset, scrollOffset + visibleCount);
  const hasAbove = scrollOffset > 0;
  const hasMore = scrollOffset + visibleCount < data.length;

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

      {/* Scroll up indicator — below separator, in the data area */}
      {hasAbove ? (
        <Box justifyContent="center" width={totalWidth}>
          <Text color="gray" dimColor>▲ {scrollOffset} more</Text>
        </Box>
      ) : null}

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
