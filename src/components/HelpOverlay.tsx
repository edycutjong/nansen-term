import React from 'react';
import { Box, Text } from 'ink';

export default function HelpOverlay() {
  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
    >
      <Text color="cyan" bold>⌨ KEYBOARD SHORTCUTS</Text>
      <Text> </Text>
      <Box flexDirection="column">
        <Text><Text color="yellow" bold>Tab / Shift+Tab</Text>  Cycle through panes</Text>
        <Text><Text color="yellow" bold>↑ / ↓          </Text>  Scroll within active pane</Text>
        <Text><Text color="yellow" bold>Enter          </Text>  Select token → detail overlay</Text>
        <Text><Text color="yellow" bold>C              </Text>  Cycle chain (18 chains)</Text>
        <Text><Text color="yellow" bold>W              </Text>  Switch wallet</Text>
        <Text><Text color="yellow" bold>Q              </Text>  Open trade quote modal</Text>
        <Text><Text color="yellow" bold>T              </Text>  Execute quoted trade</Text>
        <Text><Text color="yellow" bold>A              </Text>  Add new wallet</Text>
        <Text><Text color="yellow" bold>R              </Text>  Refresh current pane</Text>
        <Text><Text color="yellow" bold>P              </Text>  Refresh all panes</Text>
        <Text><Text color="yellow" bold>S              </Text>  Toggle streaming mode</Text>
        <Text><Text color="yellow" bold>?              </Text>  This help overlay</Text>
        <Text><Text color="yellow" bold>Esc            </Text>  Close overlay / go back</Text>
        <Text><Text color="yellow" bold>Ctrl+C         </Text>  Exit</Text>
      </Box>
      <Text> </Text>
      <Text color="gray" dimColor>Press Esc to close</Text>
    </Box>
  );
}
