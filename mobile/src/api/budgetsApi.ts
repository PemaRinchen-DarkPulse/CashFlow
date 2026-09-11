import { request, type ApiResult } from '@/src/api/client';
import type { Budget } from '@/src/types';

export type BudgetInput = {
  categoryId: string;
  limit: number;
  /**
   * The id this device already uses for the row. Sending it keeps the local
   * list and the database pointing at the same cap, and makes the write
   * idempotent — a retry after a dropped connection returns the stored record
   * rather than putting a second limit on the same category.
   */
  id?: string;
};

/** The whole list — the app derives spent-vs-limit from it against the ledger. */
export function fetchServerBudgets(token: string): Promise<ApiResult<{ budgets: Budget[] }>> {
  return request('/api/budgets', { token });
}

export function createServerBudget(
  token: string,
  data: BudgetInput
): Promise<ApiResult<{ budget: Budget }>> {
  return request('/api/budgets', { method: 'POST', body: data, token });
}

/** Every field is optional. Spent is not a field — the ledger owns that figure. */
export function updateServerBudget(
  token: string,
  id: string,
  data: Partial<Omit<BudgetInput, 'id'>>
): Promise<ApiResult<{ budget: Budget }>> {
  return request(`/api/budgets/${encodeURIComponent(id)}`, { method: 'PATCH', body: data, token });
}

/** Resolves with no body — the server answers 204. */
export function deleteServerBudget(token: string, id: string): Promise<ApiResult<undefined>> {
  return request(`/api/budgets/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}
