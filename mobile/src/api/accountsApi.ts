import { request, type ApiResult } from '@/src/api/client';
import type { Account, IconName } from '@/src/types';

export function fetchServerAccounts(token: string): Promise<ApiResult<{ accounts: Account[] }>> {
  return request('/api/accounts', { token });
}

export function createServerAccount(
  token: string,
  data: { name: string; balance?: number; color?: string; icon?: IconName; last4?: string }
): Promise<ApiResult<{ account: Account }>> {
  return request('/api/accounts', {
    method: 'POST',
    body: data,
    token,
  });
}

