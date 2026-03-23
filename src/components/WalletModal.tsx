import React from 'react';
import { Box, Text } from 'ink';

export default function WalletModal() {
  return (
    <Box flexDirection="column" borderStyle="double" borderColor="yellow" paddingX={2} paddingY={1}>
      <Text color="yellow" bold>👛 ADD NEW WALLET</Text>
      <Text> </Text>
      <Text color="gray">To add a new wallet, open a <Text bold color="white">separate terminal window</Text></Text>
      <Text color="gray">and run the following Nansen CLI command:</Text>
      <Text> </Text>
      <Text color="cyan" bold>─── QUICK COMMAND ───</Text>
      <Text> </Text>
      <Text color="white">Register local wallet:</Text>
      <Text color="gray">  nansen wallet create --name my-wallet --evm-address 0x... --solana-address ...</Text>
      <Text> </Text>
      <Text color="red" bold>⚠ CAUTION: NansenTerm only reads wallets created via CLI.</Text>
      <Text color="gray">After creating, close this modal and press [W] to see your new wallet.</Text>
      <Text> </Text>
      <Text color="gray" dimColor>[Esc] Close</Text>
    </Box>
  );
}
