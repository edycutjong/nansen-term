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
  // "maxRows" now strictly means EXACTLY how many data rows + bottom indicator rows we can render.
  let scrollOffset = 0;
  let visibleCount = maxRows ?? data.length;
  let showAbove = false;
  let showBelow = false;

  if (maxRows !== undefined && data.length > maxRows) {
    if (selectedIndex !== undefined && selectedIndex >= 0) {
      // Basic idea: we want visibleCount to be maxRows - 1 (to leave room for ▼)
      visibleCount = Math.max(1, maxRows - 1);

      // Ensure the selected item is somewhere in [scrollOffset, scrollOffset + visibleCount - 1]
      scrollOffset = Math.max(0, Math.min(selectedIndex - visibleCount + 1, data.length - visibleCount));
    } else {
      visibleCount = Math.max(1, maxRows - 1);
      scrollOffset = 0;
    }

    // Now refine: if we are at the very bottom, or only 1 item remaining, reclaim the ▼ row for data.
    const remaining = data.length - scrollOffset - visibleCount;

    if (remaining === 1) {
      visibleCount += 1; // reclaim the ▼ row
    } else if (scrollOffset + visibleCount >= data.length) {
      visibleCount = maxRows; // reclaim the ▼ row completely
      scrollOffset = Math.max(0, data.length - visibleCount); // shift up to fit
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

      {/* Separator / Top Indicator */}
      <Box width={totalWidth}>
        {showAbove ? (() => {
          const msg = ` ▴ ${scrollOffset} more `;
          const dashCount = Math.max(0, totalWidth - msg.length);
          const leftDashes = Math.floor(dashCount / 2);
          const rightDashes = dashCount - leftDashes;
          return <Text color="gray" dimColor>{'─'.repeat(leftDashes)}{msg}{'─'.repeat(rightDashes)}</Text>;
        })() : (
          columns.map((col, i) => (
            <Box key={i} width={col.width}>
              <Text color="gray" dimColor>{'─'.repeat(col.width - 1)}</Text>
            </Box>
          ))
        )}
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
      {showBelow ? (
        <Box justifyContent="center" width={totalWidth}>
          <Text color="gray" dimColor>▾ {data.length - scrollOffset - visibleCount} more</Text>
        </Box>
      ) : null}
    </Box>
  );
}
