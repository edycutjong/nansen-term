export interface NansenResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  status?: number;
}

export interface NetflowEntry {
  token_symbol: string;
  token_name?: string;
  token_address?: string;
  chain?: string;
  net_flow_1h_usd?: number;
  net_flow_24h_usd?: number;
  net_flow_7d_usd?: number;
  net_flow_30d_usd?: number;
  inflow_usd?: number;
  outflow_usd?: number;
}

export interface DexTrade {
  timestamp?: string;
  time?: string;
  buyer_token_symbol?: string;
  seller_token_symbol?: string;
  buyer_address?: string;
  seller_address?: string;
  value_usd?: number;
  chain?: string;
  tx_hash?: string;
}

export interface PerpEntry {
  symbol: string;
  funding_rate?: number;
  open_interest?: number;
  oi_change_24h?: number;
  volume_24h?: number;
  price?: number;
}

export interface WalletInfo {
  name: string;
  type?: string;
  evm_address?: string;
  solana_address?: string;
  created_at?: string;
}

export interface BalanceEntry {
  token_symbol: string;
  token_name?: string;
  balance?: number;
  value_usd?: number;
  token_address?: string;
}

export interface TokenInfo {
  name?: string;
  symbol?: string;
  address?: string;
  chain?: string;
  price_usd?: number;
  market_cap?: number;
  volume_24h?: number;
  price_change_24h?: number;
}

export interface TokenIndicators {
  nansen_score?: number;
  smart_money_score?: number;
  risk_score?: number;
  reward_score?: number;
}

export interface TradeQuote {
  from_token?: string;
  to_token?: string;
  from_amount?: string;
  to_amount?: string;
  price_impact?: number;
  slippage?: number;
  chain?: string;
}

export interface SearchResult {
  name?: string;
  symbol?: string;
  address?: string;
  chain?: string;
  type?: string;
}

export type Chain =
  | 'ethereum' | 'solana' | 'base' | 'bnb'
  | 'arbitrum' | 'polygon' | 'optimism' | 'avalanche'
  | 'linea' | 'scroll' | 'mantle' | 'ronin'
  | 'sei' | 'plasma' | 'sonic' | 'monad'
  | 'hyperevm' | 'iotaevm';

export type PaneId = 'netflow' | 'dex-trades' | 'perp' | 'wallet';

export interface AppState {
  activePane: PaneId;
  chain: Chain;
  walletName: string | null;
  apiCallCount: number;
  lastRefresh: Date | null;
  showHelp: boolean;
  isStreaming: boolean;
}
