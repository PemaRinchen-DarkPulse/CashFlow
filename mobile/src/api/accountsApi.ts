import { request, type ApiResult } from '@/src/api/client';
import type { Account, IconName } from '@/src/types';

export type AccountInput = {
  name: string;
  balance?: number;
  color?: string;
  icon?: IconName;
  /**
   * Only sent when handing an account this device already holds to the server.
   * Keeping the id means the transactions pointing at it still resolve.
   */
  id?: string;
};

export function fetchServerAccounts(token: string): Promise<ApiResult<{ accounts: Account[] }>> {
  return request('/api/accounts', { token });
}

export function createServerAccount(
  token: string,
  data: AccountInput
): Promise<ApiResult<{ account: Account }>> {
  return request('/api/accounts', { method: 'POST', body: data, token });
}

export function updateServerAccount(
  token: string,
  id: string,
  data: Partial<Omit<AccountInput, 'id'>>
): Promise<ApiResult<{ account: Account }>> {
  return request(`/api/accounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: data,
    token,
  });
}

/** Resolves with no body — the server answers 204. */
export function deleteServerAccount(token: string, id: string): Promise<ApiResult<undefined>> {
  return request(`/api/accounts/${encodeURIComponent(id)}`, { method: 'DELETE', token });
}
