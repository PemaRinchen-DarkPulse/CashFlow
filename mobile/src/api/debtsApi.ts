import { request, type ApiResult } from '@/src/api/client';
import type { Debt } from '@/src/types';

export type DebtInput = {
  person: string;
  direction: Debt['direction'];
  principal: number;
  /** Defaults to nothing settled. Capped at `principal` by the server. */
  repaid?: number;
  /** ISO date string. */
  date: string;
  note?: string;
  accountId: string;
  /**
   * The id this device already uses for the record. Sending it keeps the local
   * list and the database pointing at the same row, and makes the write
   * idempotent — a retry after a dropped connection returns the stored record
   * rather than logging the same loan twice.
   */
  id?: string;
};

/** The whole list, newest first — the app sums its own totals from it. */
export function fetchServerDebts(token: string): Promise<ApiResult<{ debts: Debt[] }>> {
  return request('/api/debts', { token });
}

export function createServerDebt(
  token: string,
  data: DebtInput
): Promise<ApiResult<{ debt: Debt }>> {
  return request('/api/debts', { method: 'POST', body: data, token });
}

/**
 * Every field is optional. A repayment goes through here as the new running
 * `repaid` total rather than an increment, so a request that arrives twice
 * settles the debt once.
 */
export function updateServerDebt(
  token: string,
  id: string,
  data: Partial<Omit<DebtInput, 'id'>>
): Promise<ApiResult<{ debt: Debt }>> {
  return request(`/api/debts/${encodeURIComponent(id)}`, { method: 'PATCH', body: data, token });
}

/** Resolves with no body — the server answers 204. */
export function deleteServerDebt(token: string, id: string): Promise<ApiResult<undefined>> {
  return request(`/api/debts/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}
