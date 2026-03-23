import { Box, Text } from 'ink';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD, formatNumber, formatPercent } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface TokenDetailProps {
  chain: Chain;
  tokenAddress: string;
}

export default function TokenDetail({ chain, tokenAddress }: TokenDetailProps) {
  const { data: infoData, loading: infoLoading } = useNansen(
    'research token info',
    ['--chain', chain, '--token', tokenAddress],
  );

  const { data: indicatorData, loading: indicatorLoading } = useNansen(
    'research token indicators',
    ['--chain', chain, '--token', tokenAddress],
  );

  if (infoLoading || indicatorLoading) {
    return (
      <Box flexDirection="column" borderStyle="double" borderColor="gray" paddingX={2} paddingY={1}>
        <Text color="cyan" bold>🔍 TOKEN DETAIL</Text>
        <Text color="yellow">Loading token data...</Text>
      </Box>
    );
  }

  const info = (infoData ?? {}) as Record<string, unknown>;
  const indicators = (indicatorData ?? {}) as Record<string, unknown>;

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="gray" paddingX={2} paddingY={1}>
      <Text color="cyan" bold>🔍 TOKEN DETAIL</Text>
      <Text> </Text>

      <Box flexDirection="column">
        <Box>
          <Text color="gray">Name:     </Text>
          <Text color="white" bold>{String(info.name ?? info.token_name ?? '—')}</Text>
        </Box>
        <Box>
          <Text color="gray">Symbol:   </Text>
          <Text color="white" bold>{String(info.symbol ?? info.token_symbol ?? '—')}</Text>
        </Box>
        <Box>
          <Text color="gray">Chain:    </Text>
          <Text color="white">{chain}</Text>
        </Box>
        <Box>
          <Text color="gray">Address:  </Text>
          <Text color="white">{(() => {
            const addr = String(info.address ?? info.token_address ?? tokenAddress);
            return addr.length > 20 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr;
          })()}</Text>
        </Box>
      </Box>

      <Text> </Text>
      <Text color="cyan" bold>─── MARKET DATA ───</Text>

      <Box flexDirection="column">
        <Box>
          <Text color="gray">Price:       </Text>
          <Text color="green" bold>{formatUSD(Number(info.price_usd ?? info.price ?? 0))}</Text>
        </Box>
        <Box>
          <Text color="gray">24h Change:  </Text>
          <Text color={Number(info.price_change_24h ?? 0) >= 0 ? 'green' : 'red'}>
            {formatPercent(Number(info.price_change_24h ?? info.priceChange24h ?? 0))}
          </Text>
        </Box>
        <Box>
          <Text color="gray">Market Cap:  </Text>
          <Text color="white">{formatUSD(Number(info.market_cap ?? info.marketCap ?? 0))}</Text>
        </Box>
        <Box>
          <Text color="gray">Volume 24h:  </Text>
          <Text color="white">{formatUSD(Number(info.volume_24h ?? info.volume24h ?? 0))}</Text>
        </Box>
      </Box>

      <Text> </Text>
      <Text color="cyan" bold>─── NANSEN SCORE ───</Text>

      <Box flexDirection="column">
        <Box>
          <Text color="gray">Nansen Score: </Text>
          <Text color="yellow" bold>{formatNumber(Number(indicators.nansen_score ?? indicators.nansenScore ?? 0))}</Text>
        </Box>
        <Box>
          <Text color="gray">SM Score:     </Text>
          <Text color="yellow">{formatNumber(Number(indicators.smart_money_score ?? indicators.smartMoneyScore ?? 0))}</Text>
        </Box>
      </Box>
    </Box>
  );
}
