import { Box, Text } from 'ink';
import { useNansen } from '../hooks/useNansen.js';
import { formatUSD, formatNumber, formatPercent } from '../lib/formatter.js';
import type { Chain } from '../types/nansen.js';

interface TokenDetailProps {
  chain: Chain;
  tokenAddress: string;
}

function SingleTokenDetail({ chain, tokenAddress }: { chain: Chain; tokenAddress: string }) {
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
      <Box flexDirection="column" paddingY={1}>
        <Text color="yellow">Loading '{tokenAddress}' data...</Text>
      </Box>
    );
  }

  const info = (infoData ?? {}) as Record<string, unknown>;
  const indicators = (indicatorData ?? {}) as Record<string, unknown>;

  return (
    <Box flexDirection="column">
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
      </Box>

      <Text> </Text>
      <Text color="cyan" bold>─── SCORE ───</Text>

      <Box flexDirection="column">
        <Box>
          <Text color="gray">Nansen: </Text>
          <Text color="yellow" bold>{formatNumber(Number(indicators.nansen_score ?? indicators.nansenScore ?? 0))}</Text>
          <Text color="gray"> | SM: </Text>
          <Text color="yellow">{formatNumber(Number(indicators.smart_money_score ?? indicators.smartMoneyScore ?? 0))}</Text>
        </Box>
      </Box>
    </Box>
  );
}

export default function TokenDetail({ chain, tokenAddress }: TokenDetailProps) {
  const tokens = tokenAddress.includes('→') ? tokenAddress.split('→').map(t => t.trim()) : [tokenAddress];

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="gray" paddingX={2} paddingY={1}>
      <Text color="cyan" bold>🔍 TOKEN DETAIL</Text>
      <Text color="gray">Chain: {chain}</Text>
      <Text> </Text>

      <Box flexDirection="row" width="100%">
        {tokens.map((token, index) => (
          <Box
            key={token}
            flexDirection="column"
            flexGrow={1}
            flexBasis={tokens.length > 1 ? '50%' : '100%'}
            paddingLeft={index > 0 ? 2 : 0}
            paddingRight={index === 0 && tokens.length > 1 ? 2 : 0}
            borderStyle={index > 0 ? 'single' : undefined}
            borderRight={false}
            borderTop={false}
            borderBottom={false}
            borderLeft={index > 0}
            borderColor="gray"
          >
            <SingleTokenDetail chain={chain} tokenAddress={token} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
