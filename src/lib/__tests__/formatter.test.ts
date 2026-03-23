import { describe, it, expect } from 'vitest';
import {
  formatUSD,
  formatNumber,
  formatPercent,
  formatTime,
  truncate,
  padRight,
  padLeft,
} from '../formatter.js';

describe('formatter', () => {
  describe('formatUSD', () => {
    it('handles null/undefined/NaN', () => {
      expect(formatUSD(null)).toBe('—');
      expect(formatUSD(undefined)).toBe('—');
      expect(formatUSD(NaN)).toBe('—');
    });

    it('formats billions', () => {
      expect(formatUSD(1_500_000_000)).toBe('+$1.5B');
      expect(formatUSD(-2_000_000_000)).toBe('-$2.0B');
    });

    it('formats millions', () => {
      expect(formatUSD(1_500_000)).toBe('+$1.5M');
      expect(formatUSD(-2_000_000)).toBe('-$2.0M');
    });

    it('formats thousands', () => {
      expect(formatUSD(1_500)).toBe('+$1.5K');
      expect(formatUSD(-2_000)).toBe('-$2.0K');
    });

    it('formats >= 1', () => {
      expect(formatUSD(1.234)).toBe('+$1.23');
      expect(formatUSD(-2.5)).toBe('-$2.50');
    });

    it('formats < 1', () => {
      expect(formatUSD(0.12345)).toBe('+$0.1235');
      expect(formatUSD(-0.005)).toBe('-$0.0050');
      expect(formatUSD(0)).toBe('$0.0000');
    });
  });

  describe('formatNumber', () => {
    it('handles null/undefined/NaN', () => {
      expect(formatNumber(null)).toBe('—');
      expect(formatNumber(undefined)).toBe('—');
      expect(formatNumber(NaN)).toBe('—');
    });

    it('formats billions', () => {
      expect(formatNumber(1_500_000_000)).toBe('1.5B');
      expect(formatNumber(-2_000_000_000)).toBe('-2.0B');
    });

    it('formats millions', () => {
      expect(formatNumber(1_500_000)).toBe('1.5M');
      expect(formatNumber(-2_000_000)).toBe('-2.0M');
    });

    it('formats thousands', () => {
      expect(formatNumber(1_500)).toBe('1.5K');
      expect(formatNumber(-2_000)).toBe('-2.0K');
    });

    it('formats < 1000', () => {
      expect(formatNumber(1.234)).toBe('1.23');
      expect(formatNumber(-2.5)).toBe('-2.50');
      expect(formatNumber(0)).toBe('0.00');
    });
  });

  describe('formatPercent', () => {
    it('handles null/undefined/NaN', () => {
      expect(formatPercent(null)).toBe('—');
      expect(formatPercent(undefined)).toBe('—');
      expect(formatPercent(NaN)).toBe('—');
    });

    it('formats percentages', () => {
      expect(formatPercent(12.3456)).toBe('+12.346%');
      expect(formatPercent(-5.6789)).toBe('-5.679%');
      expect(formatPercent(0)).toBe('0.000%');
    });
  });

  describe('formatTime', () => {
    it('handles falsy timestamp', () => {
      expect(formatTime(null)).toBe('—');
      expect(formatTime(undefined)).toBe('—');
      expect(formatTime('')).toBe('—');
    });

    it('formats valid timestamp', () => {
      // Create a specific time to avoid timezone issues where possible, 
      // but Date.prototype.toLocaleTimeString is timezone dependent.
      // We will test the fallback behavior by passing an invalid date string.
      const time = formatTime('invalid-date-string');
      expect(time).toBe('e-str'); // 'invalid-date-string'.slice(11, 16)

      const shortTime = formatTime('abc');
      expect(shortTime).toBe('—');
    });

    it('formats date correctly', () => {
      const d = new Date('2024-01-01T15:30:00Z');
      expect(formatTime(d.toISOString())).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('truncate', () => {
    it('returns original string if within maxLen', () => {
      expect(truncate('hello', 10)).toBe('hello');
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('truncates string and adds ellipsis', () => {
      expect(truncate('hello world', 5)).toBe('hell…');
    });
  });

  describe('padRight and padLeft', () => {
    it('pads right', () => {
      expect(padRight('abc', 5)).toBe('abc  ');
    });

    it('pads left', () => {
      expect(padLeft('abc', 5)).toBe('  abc');
    });
  });
});
