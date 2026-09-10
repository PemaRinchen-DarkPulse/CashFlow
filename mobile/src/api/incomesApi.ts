import { request, type ApiResult } from '@/src/api/client';

/** One row of the server's `incomes` collection. */
export type ServerIncome = {
  id: string;
  title: string;
  accountId: string;
  categoryId: string;
  amount: number;
  /** ISO date string. */
  date: string;
  note?: string;
  kind: 'income';
};

export type IncomeInput = {
  title: string;
  accountId: string;
  categoryId: string;
  amount: number;
  date: string;
  note?: string;
  /**
   * The id this device already uses for the entry. Sending it keeps the local
   * ledger and the database pointing at the same row, and makes the write
   * idempotent — a retry after a dropped connection returns the stored entry
   * rather than booking the same payday twice.
   */
  id?: string;
};

export type IncomeRange = {
  /** ISO date strings; the server filters on the stored date. */
  from?: string;
  to?: string;
  accountId?: string;
  limit?: number;
};

/**
 * Income for the signed-in user, newest first, with the summed `total` for the
 * range. The total is computed over the whole range server-side rather than
 * over the page, so a capped listing still reports the true figure.
 */
export function fetchServerIncomes(
  token: string,
  range: IncomeRange = {}
): Promise<ApiResult<{ incomes: ServerIncome[]; total: number; count: number }>> {
  const query = new URLSearchParams();
  if (range.from) query.set('from', range.from);
  if (range.to) query.set('to', range.to);
  if (range.accountId) query.set('accountId', range.accountId);
  if (range.limit !== undefined) query.set('limit', String(range.limit));

  const suffix = query.toString();
  return request(`/api/incomes${suffix ? `?${suffix}` : ''}`, { token });
}

export function createServerIncome(
  token: string,
  data: IncomeInput
): Promise<ApiResult<{ income: ServerIncome }>> {
  return request('/api/incomes', { method: 'POST', body: data, token });
}

/** Resolves with no body — the server answers 204. */
export function deleteServerIncome(token: string, id: string): Promise<ApiResult<undefined>> {
  return request(`/api/incomes/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}
