import { request, type ApiResult } from '@/src/api/client';
import type { Settings } from '@/src/types';

/**
 * How the account is set up, as the server holds it.
 *
 * The four toggles are the app's `Settings` exactly, so the two cannot drift:
 * adding a setting to that type and forgetting it here is a type error rather
 * than a preference that silently stays on one phone. The currency rides along
 * because it belongs to the same answer, even though the app keeps it on the
 * profile rather than in settings.
 */
export type ServerPreferences = Settings & {
  /** A symbol shown beside every amount — `Nu.`, `$`. */
  currency: string;
};

/**
 * Every preference, always complete. A brand-new account answers with the
 * defaults rather than a 404, so there is no "unset" case to handle.
 */
export function fetchServerPreferences(
  token: string
): Promise<ApiResult<{ preferences: ServerPreferences }>> {
  return request('/api/preferences', { token });
}

/**
 * Change some of them. Only what is passed is written, so flipping one switch
 * sends one field — two devices changing different settings cannot then
 * overwrite each other's.
 */
export function updateServerPreferences(
  token: string,
  patch: Partial<ServerPreferences>
): Promise<ApiResult<{ preferences: ServerPreferences }>> {
  return request('/api/preferences', { method: 'PATCH', body: patch, token });
}
