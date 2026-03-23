import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD } from '../lib/formatter.js';
import { CHAIN_META } from '../lib/chains.js';
import type { Chain } from '../types/nansen.js';

interface TradeModalProps {
  chain: Chain;
  walletName: string | null;
}

export default function TradeModal({ chain, walletName }: TradeModalProps) {
  const meta = CHAIN_META[chain];

  // Check if chain supports trading
  if (!meta.supportsTrading) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor="yellow" paddingX={2} paddingY={1}>
        <Text color="yellow" bold>💱 TRADE</Text>
        <Text> </Text>
        <Text color="red">Trading only supported on Solana and Base.</Text>
        <Text color="gray">Current chain: {meta.name}</Text>
        <Text color="gray">Press [C] to switch chains, then try again.</Text>
        <Text> </Text>
        <Text color="gray" dimColor>[Esc] Close</Text>
      </Box>
    );
  }

  if (!walletName) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor="yellow" paddingX={2} paddingY={1}>
        <Text color="yellow" bold>💱 TRADE</Text>
        <Text> </Text>
        <Text color="red">No wallet selected.</Text>
        <Text color="gray">Run: nansen wallet create</Text>
        <Text color="gray">Then press [W] to select a wallet.</Text>
        <Text> </Text>
        <Text color="gray" dimColor>[Esc] Close</Text>
      </Box>
    );
  }

  // Show trade quote form
  // In a full implementation, this would use TextInput from ink for from/to/amount fields
  // For now, we show the quote command the user would run

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="green" paddingX={2} paddingY={1}>
      <Text color="green" bold>💱 TRADE QUOTE</Text>
      <Text> </Text>

      <Box flexDirection="column">
        <Box>
          <Text color="gray">Chain:    </Text>
          <Text color="cyan" bold>{meta.emoji} {meta.name}</Text>
        </Box>
        <Box>
          <Text color="gray">Wallet:   </Text>
          <Text color="yellow" bold>{walletName}</Text>
        </Box>
      </Box>

      <Text> </Text>
      <Text color="gray">To get a quote or execute a trade, open a <Text bold color="white">separate terminal window</Text></Text>
      <Text color="gray">and run the following Nansen CLI commands:</Text>
      <Text> </Text>
      <Text color="cyan" bold>─── QUICK COMMANDS ───</Text>
      <Text> </Text>

      <Box flexDirection="column">
        <Text color="white">Get a quote:</Text>
        <Text color="gray">  nansen trade quote --chain {chain} --from SOL --to USDC --amount 1 --wallet {walletName}</Text>
        <Text> </Text>
        <Text color="white">Execute trade:</Text>
        <Text color="gray">  nansen trade execute --chain {chain} --wallet {walletName}</Text>
      </Box>

      <Text> </Text>
      <Text color="red" bold>⚠ CAUTION: trade execute sends real transactions!</Text>
      <Text> </Text>
      <Text color="gray" dimColor>[Esc] Close</Text>
    </Box>
  );
}
