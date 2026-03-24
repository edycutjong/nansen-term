import { Box, Text } from 'ink';
import Pane from './Pane.js';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface WalletPaneProps {
  chain: Chain;
  walletName: string | null;
  isActive: boolean;
  height?: number;
  paneNumber?: number;
  refreshTrigger?: number;
  selectedIndex?: number;
  onSelectWallet?: (name: string) => void;
}

export default function WalletPane({
  chain,
  walletName,
  isActive,
  height,
  paneNumber,
  refreshTrigger = 0,
  selectedIndex = -1,
}: WalletPaneProps) {
  const { data: walletListData, loading: listLoading } = useNansen(
    'wallet list',
    [],
    true,
    refreshTrigger,
  );

  const { data: walletData, loading: walletLoading, error: walletError } = useNansen(
    'wallet show',
    walletName ? ['--name', walletName] : [],
    !!walletName,
    refreshTrigger,
  );

  // Get wallet address for balance fetch
  const wallet = (walletData as Record<string, unknown>) ?? {};
  const evmAddr = String(wallet.evm_address ?? wallet.evmAddress ?? wallet.address ?? '');
  const solAddr = String(wallet.solana_address ?? wallet.solanaAddress ?? '');
  const balanceAddr = chain === 'solana' ? solAddr : evmAddr;
  const truncAddr = (addr: string) => addr.length > 20 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || '—';

  const { data: balanceData, loading: balanceLoading } = useNansen(
    'research profiler balance',
    balanceAddr && balanceAddr !== '—' ? ['--address', balanceAddr, '--chain', chain] : [],
    !!walletName && !!balanceAddr && balanceAddr !== '—',
    refreshTrigger,
  );

  // Parse wallet list
  const wallets: Record<string, unknown>[] = Array.isArray(walletListData)
    ? walletListData as Record<string, unknown>[]
    : ((walletListData as Record<string, unknown>)?.wallets as Record<string, unknown>[] ?? []);

  const walletCount = wallets.length;

  if (listLoading || walletLoading) {
    return (
    <Pane title="Wallet" emoji="🏦" isActive={isActive} paneNumber={paneNumber} width="50%" height={height}>
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  if (!walletName) {
    // Show selectable wallet list
    const clampedIdx = walletCount > 0 ? Math.min(selectedIndex, walletCount - 1) : -1;

    // Scroll windowing: 3 chrome lines inside pane (instruction + blank + footer)
    // plus 1 blank line after list = 4 lines of chrome; rest is for wallet items
    const maxVisible = Math.max(1, (height ?? 10) - 5 - 4);
    let scrollStart = 0;
    if (clampedIdx >= maxVisible) {
      scrollStart = clampedIdx - maxVisible + 1;
    }
    const visibleWallets = wallets.slice(scrollStart, scrollStart + maxVisible);
    const aboveCount = scrollStart;
    const belowCount = walletCount - scrollStart - visibleWallets.length;

    return (
    <Pane title="Wallet" emoji="🏦" isActive={isActive} paneNumber={paneNumber} width="50%" height={height}>
        {walletCount === 0 ? (
          <Box flexDirection="column" alignItems="center" paddingTop={2}>
            <Text color="gray">No wallets found.</Text>
            <Text color="gray">Run: nansen wallet create</Text>
            <Text color="gray">Press <Text color="cyan">[A]</Text> for instructions.</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text color="gray">Select a wallet (↑↓ + Enter):</Text>
            <Text> </Text>
            {aboveCount > 0 && (
              <Text color="gray" dimColor>  ▴ {aboveCount} more</Text>
            )}
            {visibleWallets.map((w, i) => {
              const realIdx = scrollStart + i;
              const name = String((w as Record<string, unknown>).name ?? `wallet-${realIdx}`);
              const isHighlighted = isActive && realIdx === clampedIdx;
              return (
                <Text
                  key={realIdx}
                  color={isHighlighted ? 'black' : 'white'}
                  backgroundColor={isHighlighted ? 'cyan' : undefined}
                  bold={isHighlighted}
                >
                  {isHighlighted ? ' ▸ ' : '   '}{name}
                </Text>
              );
            })}
            {belowCount > 0 && (
              <Text color="gray" dimColor>  ▾ {belowCount} more</Text>
            )}
            <Text> </Text>
            <Text color="gray" dimColor>[A] Add Wallet</Text>
          </Box>
        )}
      </Pane>
    );
  }

  // Parse balances
  const balances: Record<string, unknown>[] = Array.isArray(balanceData)
    ? balanceData as Record<string, unknown>[]
    : [];

  // Cap balance rows: pane chrome(5) + name(1) + margin(1) + footer(2) = 9 overhead
  const maxBalanceRows = Math.max(1, (height ?? 10) - 9);

  return (
    <Pane title="Wallet" emoji="🏦" isActive={isActive} paneNumber={paneNumber} width="50%" height={height}>
      <Box flexDirection="column">
        <Box>
          <Text color="gray">Name: </Text>
          <Text color="white" bold>{walletName}</Text>
        </Box>

        {balanceLoading ? (
          <Text color="yellow">Loading balances...</Text>
        ) : balances.length > 0 ? (
          <Box flexDirection="column" marginTop={1}>
            {balances.slice(0, maxBalanceRows).map((b, i) => {
              const symbol = String(b.token_symbol ?? b.symbol ?? '???');
              const amount = Number(b.balance ?? b.amount ?? 0);
              const valueUsd = Number(b.value_usd ?? b.usd_value ?? 0);
              return (
                <Box key={i}>
                  <Text color="gray">{symbol.padEnd(6)} </Text>
                  <Text color="white">{amount < 0.01 ? amount.toFixed(6) : amount.toFixed(2)}</Text>
                  <Text color="gray"> ({formatUSD(valueUsd)})</Text>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Text color="gray">EVM:  </Text>
              <Text color="white">{truncAddr(evmAddr)}</Text>
            </Box>
            <Box>
              <Text color="gray">SOL:  </Text>
              <Text color="white">{truncAddr(solAddr)}</Text>
            </Box>
          </Box>
        )}

        {walletError && <Text color="red">{walletError}</Text>}
        <Box marginTop={1}>
          <Text color="gray" dimColor>{isActive ? '[Esc] Back  ' : ''}[W] Switch  [A] Add</Text>
        </Box>
      </Box>
    </Pane>
  );
}
