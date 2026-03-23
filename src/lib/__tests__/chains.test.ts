import { describe, it, expect } from 'vitest';
import { nextChain, prevChain, CHAINS, CHAIN_META } from '../chains.js';

describe('chains', () => {
  it('CHAINS array has correct elements', () => {
    expect(CHAINS).toContain('ethereum');
    expect(CHAINS).toContain('solana');
  });

  it('CHAIN_META maps correctly', () => {
    expect(CHAIN_META['ethereum'].name).toBe('Ethereum');
    expect(CHAIN_META['solana'].supportsTrading).toBe(true);
  });

  describe('nextChain', () => {
    it('cycles forward', () => {
      expect(nextChain('ethereum')).toBe('solana');
    });

    it('wraps around to the beginning', () => {
      const lastChain = CHAINS[CHAINS.length - 1];
      expect(nextChain(lastChain!)).toBe(CHAINS[0]);
    });
  });

  describe('prevChain', () => {
    it('cycles backward', () => {
      expect(prevChain('solana')).toBe('ethereum');
    });

    it('wraps around to the end', () => {
      const firstChain = CHAINS[0];
      const lastChain = CHAINS[CHAINS.length - 1];
      expect(prevChain(firstChain!)).toBe(lastChain);
    });
  });
});
