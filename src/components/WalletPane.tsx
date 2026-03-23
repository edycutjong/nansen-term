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
}

export default function WalletPane({ chain, walletName, isActive, height, refreshTrigger = 0 }: WalletPaneProps) {
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

  if (listLoading || walletLoading) {
    return (
      <Pane title="Wallet" emoji="🏦" isActive={isActive} width="50%" height={height}>
        <Text color="yellow">Loading...</Text>
      </Pane>
    );
  }

  if (!walletName) {
    // Show available wallets
    const wallets = Array.isArray(walletListData)
      ? walletListData
      : (walletListData as Record<string, unknown>)?.wallets ?? [];

    return (
      <Pane title="Wallet" emoji="🏦" isActive={isActive} width="50%" height={height}>
        {(wallets as Record<string, unknown>[]).length === 0 ? (
          <Box flexDirection="column">
            <Text color="gray">No wallets found.</Text>
            <Text color="gray">Run: nansen wallet create</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Text color="gray">Available wallets:</Text>
            {(wallets as Record<string, unknown>[]).map((w, i) => (
              <Text key={i} color="white">
                • {String((w as Record<string, unknown>).name ?? `wallet-${i}`)}
              </Text>
            ))}
            <Text color="gray" dimColor>Press [W] to select</Text>
          </Box>
        )}
      </Pane>
    );
  }

  // Show wallet details
  const wallet = (walletData as Record<string, unknown>) ?? {};
  const evmAddr = String(wallet.evm_address ?? wallet.evmAddress ?? wallet.address ?? '—');
  const solAddr = String(wallet.solana_address ?? wallet.solanaAddress ?? '—');

  return (
    <Pane title="Wallet" emoji="🏦" isActive={isActive} width="50%" height={height}>
      <Box flexDirection="column">
        <Box>
          <Text color="gray">Name: </Text>
          <Text color="white" bold>{walletName}</Text>
        </Box>
        <Box>
          <Text color="gray">EVM:  </Text>
          <Text color="white">{evmAddr.length > 20 ? `${evmAddr.slice(0, 6)}…${evmAddr.slice(-4)}` : evmAddr}</Text>
        </Box>
        <Box>
          <Text color="gray">SOL:  </Text>
          <Text color="white">{solAddr.length > 20 ? `${solAddr.slice(0, 6)}…${solAddr.slice(-4)}` : solAddr}</Text>
        </Box>
        {walletError && <Text color="red">{walletError}</Text>}
        <Box marginTop={1}>
          <Text color="gray" dimColor>[Q] Get Quote  [X] Execute Trade</Text>
        </Box>
      </Box>
    </Pane>
  );
}
