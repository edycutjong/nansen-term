import type { Chain } from '../types/nansen.js';

export interface ChainMeta {
  name: string;
  shortName: string;
  emoji: string;
  supportsTrading: boolean;
}

export const CHAINS: Chain[] = [
  'ethereum', 'solana', 'base', 'bnb',
  'arbitrum', 'polygon', 'optimism', 'avalanche',
  'linea', 'scroll', 'mantle', 'ronin',
  'sei', 'plasma', 'sonic', 'monad',
  'hyperevm', 'iotaevm',
];

export const CHAIN_META: Record<Chain, ChainMeta> = {
  ethereum:  { name: 'Ethereum',  shortName: 'ETH',  emoji: '🔷', supportsTrading: false },
  solana:    { name: 'Solana',    shortName: 'SOL',  emoji: '🟣', supportsTrading: true },
  base:      { name: 'Base',      shortName: 'BASE', emoji: '🔵', supportsTrading: true },
  bnb:       { name: 'BNB Chain', shortName: 'BNB',  emoji: '🟡', supportsTrading: false },
  arbitrum:  { name: 'Arbitrum',  shortName: 'ARB',  emoji: '🔶', supportsTrading: false },
  polygon:   { name: 'Polygon',   shortName: 'POLY', emoji: '🟣', supportsTrading: false },
  optimism:  { name: 'Optimism',  shortName: 'OP',   emoji: '🔴', supportsTrading: false },
  avalanche: { name: 'Avalanche', shortName: 'AVAX', emoji: '🔺', supportsTrading: false },
  linea:     { name: 'Linea',     shortName: 'LNA',  emoji: '⚫', supportsTrading: false },
  scroll:    { name: 'Scroll',    shortName: 'SCR',  emoji: '📜', supportsTrading: false },
  mantle:    { name: 'Mantle',    shortName: 'MNT',  emoji: '🟤', supportsTrading: false },
  ronin:     { name: 'Ronin',     shortName: 'RON',  emoji: '⚔️', supportsTrading: false },
  sei:       { name: 'Sei',       shortName: 'SEI',  emoji: '🌊', supportsTrading: false },
  plasma:    { name: 'Plasma',    shortName: 'PLS',  emoji: '⚡', supportsTrading: false },
  sonic:     { name: 'Sonic',     shortName: 'SONIC', emoji: '🎵', supportsTrading: false },
  monad:     { name: 'Monad',     shortName: 'MON',  emoji: '🟢', supportsTrading: false },
  hyperevm:  { name: 'HyperEVM',  shortName: 'HYPR', emoji: '💫', supportsTrading: false },
  iotaevm:   { name: 'IOTA EVM',  shortName: 'IOTA', emoji: '🔗', supportsTrading: false },
};

export function nextChain(current: Chain): Chain {
  const idx = CHAINS.indexOf(current);
  return CHAINS[(idx + 1) % CHAINS.length]!;
}

export function prevChain(current: Chain): Chain {
  const idx = CHAINS.indexOf(current);
  return CHAINS[(idx - 1 + CHAINS.length) % CHAINS.length]!;
}
