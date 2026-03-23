import React from 'react';
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
  refreshTrigger?: number;
  selectedIndex?: number;
  onSelectWallet?: (name: string) => void;
}

export default function WalletPane({
  chain,
  walletName,
  isActive,
  height,
  refreshTrigger = 0,
  selectedIndex = -1,
  onSelectWallet,
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
      <Pane title="Wallet" emoji="🏦" isActive={isActive} width="50%" height={height}>
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  if (!walletName) {
    // Show selectable wallet list
    const clampedIdx = walletCount > 0 ? Math.min(selectedIndex, walletCount - 1) : -1;

    return (
      <Pane title="Wallet" emoji="🏦" isActive={isActive} width="50%" height={height}>
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
            {wallets.map((w, i) => {
              const name = String((w as Record<string, unknown>).name ?? `wallet-${i}`);
              const isHighlighted = isActive && i === clampedIdx;
              return (
                <Text
                  key={i}
                  color={isHighlighted ? 'black' : 'white'}
                  backgroundColor={isHighlighted ? 'cyan' : undefined}
                  bold={isHighlighted}
                >
                  {isHighlighted ? ' ▸ ' : '   '}{name}
                </Text>
              );
            })}
            <Text> </Text>
            <Text color="gray" dimColor>[Enter] Select  [W] Cycle  [A] Add Wallet</Text>
          </Box>
        )}
      </Pane>
    );
  }

  // Parse balances
  const balances: Record<string, unknown>[] = Array.isArray(balanceData)
    ? balanceData as Record<string, unknown>[]
    : [];

  return (
    <Pane title="Wallet" emoji="🏦" isActive={isActive} width="50%" height={height}>
      <Box flexDirection="column">
        <Box>
          <Text color="gray">Name: </Text>
          <Text color="white" bold>{walletName}</Text>
        </Box>

        {balanceLoading ? (
          <Text color="yellow">Loading balances...</Text>
        ) : balances.length > 0 ? (
          <Box flexDirection="column" marginTop={1}>
            {balances.slice(0, 6).map((b, i) => {
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
              <Text color="white">{evmAddr.length > 20 ? `${evmAddr.slice(0, 6)}…${evmAddr.slice(-4)}` : evmAddr || '—'}</Text>
            </Box>
            <Box>
              <Text color="gray">SOL:  </Text>
              <Text color="white">{solAddr.length > 20 ? `${solAddr.slice(0, 6)}…${solAddr.slice(-4)}` : solAddr || '—'}</Text>
            </Box>
          </Box>
        )}

        {walletError && <Text color="red">{walletError}</Text>}
        <Box marginTop={1}>
          <Text color="gray" dimColor>[Q] Quote  [X] Trade  [W] Switch  [A] Add</Text>
        </Box>
      </Box>
    </Pane>
  );
}
