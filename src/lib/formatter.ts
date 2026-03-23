/**
 * Number and currency formatting utilities for the TUI.
 */

/**
 * Format a number as compact USD (e.g., $1.2M, $450K, $23.5B).
 */
export function formatUSD(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '—';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : value > 0 ? '+' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  }
  if (abs >= 1) {
    return `${sign}$${abs.toFixed(2)}`;
  }
  return `${sign}$${abs.toFixed(4)}`;
}

/**
 * Format a number as compact (e.g., 1.2M, 450K).
 */
export function formatNumber(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '—';

  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${abs.toFixed(2)}`;
}

/**
 * Format a percentage (e.g., +0.012% or -3.5%).
 */
export function formatPercent(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
}

/**
 * Format a timestamp to HH:MM local time.
 */
export function formatTime(timestamp: string | undefined | null): string {
  if (!timestamp) return '—';
  try {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return timestamp.slice(11, 16) || '—';
  }
}

/**
 * Truncate a string to maxLen, adding '…' if needed.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Pad a string to a fixed width (right-aligned for numbers).
 */
export function padRight(str: string, width: number): string {
  return str.padEnd(width);
}

export function padLeft(str: string, width: number): string {
  return str.padStart(width);
}
