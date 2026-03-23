import { Box, Text } from 'ink';
import type { Chain } from '../types/nansen.js';
import { CHAIN_META } from '../lib/chains.js';

export type HeaderMode = 'home' | 'help' | 'token' | 'trade' | 'wallet';

interface HeaderProps {
  chain: Chain;
  walletName: string | null;
  version?: string;
  mode?: HeaderMode;
}

export default function Header({ chain, walletName, version = '1.0.0', mode = 'home' }: HeaderProps) {
  const meta = CHAIN_META[chain];

  let shortcuts = null;
  switch (mode) {
    case 'home':
      shortcuts = (
        <Text color="gray">
          ⌨ [Tab/←→] Switch Pane  [C] Chain  [W] Wallet  [Q] Quote  {walletName ? '[T] Trade  ' : ''}[R] Refresh  [?] Help  [Ctrl+C] Exit
        </Text>
      );
      break;
    case 'trade':
      shortcuts = (
        <Text color="gray">
          ⌨ <Text color="cyan">[C] Chain</Text>  [Esc] Close
        </Text>
      );
      break;
    case 'help':
    case 'token':
    case 'wallet':
    default:
      shortcuts = (
        <Text color="gray">
          ⌨ <Text color="cyan">[Q] Quote  {walletName ? '[T] Trade  ' : ''}[C] Chain</Text>  [Esc] Close
        </Text>
      );
      break;
  }

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
      <Box>{shortcuts}</Box>
    </Box>
  );
}
