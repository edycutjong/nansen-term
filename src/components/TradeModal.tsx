import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { CHAIN_META } from '../lib/chains.js';
import { fetchTradeQuote } from '../lib/nansen.js';
import { formatUSD } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface TradeModalProps {
  chain: Chain;
  walletName: string | null;
  mode?: 'quote' | 'execute';
  selectedToken?: string | null;
}

interface QuoteData {
  quote_id?: string;
  expected_output?: string;
  price_impact?: string;
  fee?: string;
  route?: string[];
  from_token?: string;
  to_token?: string;
  from_amount?: string;
  to_amount?: string;
}

export default function TradeModal({ chain, walletName, mode = 'quote', selectedToken }: TradeModalProps) {
  const meta = CHAIN_META[chain];
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default tokens based on chain
  const fromToken = selectedToken || (chain === 'solana' ? 'SOL' : 'ETH');
  const toToken = chain === 'solana' ? 'USDC' : 'USDC';

  // Auto-fetch quote when modal opens in quote mode
  useEffect(() => {
    if (mode === 'quote' && meta.supportsTrading && walletName) {
      setLoading(true);
      setError(null);
      fetchTradeQuote(chain, fromToken, toToken, '1', walletName)
        .then((result) => {
          if (result.success && result.data) {
            setQuoteData(result.data as QuoteData);
          } else {
            setError(result.error || 'Failed to get quote');
          }
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [mode, chain, fromToken, toToken, walletName, meta.supportsTrading]);

  // Check if chain supports trading
  if (!meta.supportsTrading) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor="gray" paddingX={2} paddingY={1}>
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
      <Box flexDirection="column" borderStyle="double" borderColor="gray" paddingX={2} paddingY={1}>
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

  // Execute confirmation view
  if (mode === 'execute') {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor="red" paddingX={2} paddingY={1}>
        <Text color="red" bold>⚠ CONFIRM TRADE EXECUTION</Text>
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
        <Text color="red" bold>This will execute the last quoted trade on-chain.</Text>
        <Text color="red">Real tokens will be transferred. This cannot be undone.</Text>
        <Text> </Text>
        <Text color="gray">Command that would run:</Text>
        <Text color="white">  nansen trade execute --chain {chain} --wallet {walletName}</Text>
        <Text> </Text>
        <Text color="gray" dimColor>[Esc] Cancel and go back</Text>
      </Box>
    );
  }

  // Quote view — fetches and displays real quote data
  return (
    <Box flexDirection="column" borderStyle="double" borderColor="gray" paddingX={2} paddingY={1}>
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
        <Box>
          <Text color="gray">Swap:     </Text>
          <Text color="white" bold>{fromToken} → {toToken}</Text>
        </Box>
        <Box>
          <Text color="gray">Amount:   </Text>
          <Text color="white">1 {fromToken}</Text>
        </Box>
      </Box>

      <Text> </Text>

      {loading && <Text color="yellow">⏳ Fetching quote from Nansen CLI...</Text>}
      {error && <Text color="red">✗ {error}</Text>}

      {quoteData && !loading && (
        <Box flexDirection="column">
          <Text color="cyan" bold>─── QUOTE RESULT ───</Text>
          <Text> </Text>
          <Box>
            <Text color="gray">Expected Output: </Text>
            <Text color="green" bold>{quoteData.expected_output ?? quoteData.to_amount ?? '—'}</Text>
            <Text color="gray"> {toToken}</Text>
          </Box>
          <Box>
            <Text color="gray">Price Impact:    </Text>
            <Text color={String(quoteData.price_impact ?? '').includes('-') ? 'red' : 'yellow'}>
              {quoteData.price_impact ?? '—'}
            </Text>
          </Box>
          <Box>
            <Text color="gray">Fee:             </Text>
            <Text color="white">{quoteData.fee ? formatUSD(Number(quoteData.fee)) : '—'}</Text>
          </Box>
          {quoteData.route && (
            <Box>
              <Text color="gray">Route:           </Text>
              <Text color="white">{quoteData.route.join(' → ')}</Text>
            </Box>
          )}
          <Text> </Text>
          <Text color="yellow">Press [T] to execute this trade</Text>
        </Box>
      )}

      {!quoteData && !loading && !error && (
        <Text color="gray">Preparing quote...</Text>
      )}

      <Text> </Text>
      <Text color="red" bold>⚠ CAUTION: trade execute sends real transactions!</Text>
      <Text> </Text>
      <Text color="gray" dimColor>[Esc] Close  [T] Execute trade</Text>
    </Box>
  );
}
