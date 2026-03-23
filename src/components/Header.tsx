import React from 'react';
import { Box, Text } from 'ink';
import type { Chain } from '../types/nansen.js';
import { CHAIN_META } from '../lib/chains.js';

interface HeaderProps {
  chain: Chain;
  walletName: string | null;
  version?: string;
}

export default function Header({ chain, walletName, version = '1.0.0' }: HeaderProps) {
  const meta = CHAIN_META[chain];

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box justifyContent="space-between">
        <Box>
          <Text color="green" bold>NansenTerm</Text>
          <Text color="gray"> v{version}</Text>
        </Box>
        <Box>
          <Text color="gray">Chain: </Text>
          <Text color="cyan" bold>[{meta.emoji} {meta.name} ▸]</Text>
        </Box>
        <Box>
          <Text color="gray">Wallet: </Text>
          <Text color="yellow" bold>[{walletName || 'none'}]</Text>
        </Box>
      </Box>
      <Box>
        <Text color="gray">
          ⌨ [Tab] Switch Pane  [C] Chain  [W] Wallet  [Q] Quote  [R] Refresh  [?] Help  [Ctrl+C] Exit
        </Text>
      </Box>
    </Box>
  );
}
