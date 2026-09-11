import { request, type ApiResult } from '@/src/api/client';

/** One row of the server's `expenses` collection. */
export type ServerExpense = {
  id: string;
  title: string;
  accountId: string;
  categoryId: string;
  amount: number;
  /** ISO date string. */
  date: string;
  note?: string;
  kind: 'expense';
};

export type ExpenseInput = {
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
   * rather than booking the same purchase twice.
   */
  id?: string;
};

export type ExpenseRange = {
  /** ISO date strings; the server filters on the stored date. */
  from?: string;
  to?: string;
  accountId?: string;
  limit?: number;
};

/**
 * Spending for the signed-in user, newest first, with the summed `total` for
 * the range. The total is computed over the whole range server-side rather
 * than over the page, so a capped listing still reports the true figure.
 */
export function fetchServerExpenses(
  token: string,
  range: ExpenseRange = {}
): Promise<ApiResult<{ expenses: ServerExpense[]; total: number; count: number }>> {
  const query = new URLSearchParams();
  if (range.from) query.set('from', range.from);
  if (range.to) query.set('to', range.to);
  if (range.accountId) query.set('accountId', range.accountId);
  if (range.limit !== undefined) query.set('limit', String(range.limit));

  const suffix = query.toString();
  return request(`/api/expenses${suffix ? `?${suffix}` : ''}`, { token });
}

export function createServerExpense(
  token: string,
  data: ExpenseInput
): Promise<ApiResult<{ expense: ServerExpense }>> {
  return request('/api/expenses', { method: 'POST', body: data, token });
}

/** Resolves with no body — the server answers 204. */
export function deleteServerExpense(token: string, id: string): Promise<ApiResult<undefined>> {
  return request(`/api/expenses/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}
