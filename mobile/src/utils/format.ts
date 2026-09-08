import type { TransactionKind } from '@/src/types';

const DECIMAL = /\B(?=(\d{3})+(?!\d))/g;

/** `1234.5` -> `1,234.50` */
export function formatNumber(value: number, fractionDigits = 2): string {
  const fixed = Math.abs(value).toFixed(fractionDigits);
  const [whole, fraction] = fixed.split('.');
  const grouped = whole.replace(DECIMAL, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

/**
 * Joins a currency to its digits. A single-glyph symbol (`$`, `€`) sits tight
 * against the number; a word-like code (`Nu.`, `BTN`) needs a space or it reads
 * as one run-on token.
 */
function join(currency: string, digits: string): string {
  return currency.length > 1 ? `${currency} ${digits}` : `${currency}${digits}`;
}

/** `1234.5` -> `Nu. 1,234.50` (negative values keep the sign out front). */
export function formatCurrency(value: number, currency = 'Nu.', fractionDigits = 2): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}${join(currency, formatNumber(value, fractionDigits))}`;
}

/** Signed amount for a transaction row: `+Nu. 2,500.00` / `-Nu. 129.99` */
export function formatSigned(value: number, kind: TransactionKind, currency = 'Nu.'): string {
  const sign = kind === 'income' ? '+' : '-';
  return `${sign}${join(currency, formatNumber(Math.abs(value)))}`;
}

/** `12450` -> `$12.5k`, used on chart axes where space is tight. */
export function formatCompact(value: number, currency = ''): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${currency}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${currency}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}${currency}${Math.round(abs)}`;
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value >= 0 ? '' : '-'}${Math.abs(value).toFixed(fractionDigits)}%`;
}

/**
 * Masks a value while "hide balance" is on: `Nu. 18,742.30` -> `Nu. •••••••••`.
 * Each match has to start on a digit so the currency keeps its own punctuation —
 * a blanket `[\d.,]` replace would eat the full stop in `Nu.` too.
 */
export function maskAmount(text: string): string {
  return text.replace(/\d[\d.,]*/g, (run) => '•'.repeat(run.length));
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Keeps only digits and a single decimal point, max 2 decimals. */
export function sanitizeAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (rest.length === 0) return whole.slice(0, 9);
  return `${whole.slice(0, 9)}.${rest.join('').slice(0, 2)}`;
}
