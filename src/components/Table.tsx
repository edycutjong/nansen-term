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

  // Calculate the visible window
  let scrollOffset = 0;
  let visibleCount = maxRows ?? data.length;
  let showAbove = false;
  let showBelow = false;

  if (maxRows !== undefined && data.length > maxRows) {
    // Start with reserving 1 row for ▼
    visibleCount = Math.max(1, maxRows - 1);

    if (selectedIndex !== undefined && selectedIndex >= 0) {
      // Compute scroll position
      scrollOffset = Math.max(0, Math.min(selectedIndex - visibleCount + 1, data.length - visibleCount));

      // If scrolled down, also need ▲ — steal another row
      if (scrollOffset > 0) {
        visibleCount = Math.max(1, maxRows - 2); // 1 for ▲ + 1 for ▼
        scrollOffset = Math.max(0, Math.min(selectedIndex - visibleCount + 1, data.length - visibleCount));
      }
    }

    // If only 1 item above, just show it instead of ▲ indicator
    if (scrollOffset === 1) {
      scrollOffset = 0;
      visibleCount += 1; // reclaim the ▲ row
    }

    const remaining = data.length - scrollOffset - visibleCount;

    // If only 1 item below, just show it instead of ▼ indicator
    if (remaining === 1) {
      visibleCount += 1; // reclaim the ▼ row
    }

    showAbove = scrollOffset > 0;
    showBelow = scrollOffset + visibleCount < data.length;
  }

  const rows = data.slice(scrollOffset, scrollOffset + visibleCount);

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
      {showAbove ? (
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
      {showBelow ? (
        <Box justifyContent="center" width={totalWidth}>
          <Text color="gray" dimColor>▼ {data.length - scrollOffset - visibleCount} more</Text>
        </Box>
      ) : null}
    </Box>
  );
}
