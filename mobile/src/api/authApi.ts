import { request, type ApiResult } from '@/src/api/client';

/** Matches `config.otp.length` on the server. */
export const OTP_LENGTH = 6;
/** Matches the server's resend cooldown, so the UI counts down in step with it. */
export const RESEND_COOLDOWN_SECONDS = 30;
export const MIN_PASSWORD_LENGTH = 8;

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  /** Presigned URL, signed at read time. Absent until a photo is uploaded. */
  avatar?: string;
  /** Presigned URL for the profile banner. */
  cover?: string;
};

/** A signed-in session. `expiresAt` is the server's word on when it dies. */
export type SessionPayload = {
  user: ApiUser;
  token: string;
  expiresAt: string;
};

/** Step 1 — name and email in, a six-digit code out to their inbox. */
export function startRegistration(
  name: string,
  email: string
): Promise<ApiResult<{ expiresInSec: number }>> {
  return request('/api/auth/register/start', {
    method: 'POST',
    body: { name: name.trim(), email: email.trim().toLowerCase() },
  });
}

/** Step 2 — trade the code for a short-lived pass. */
export function verifyRegistration(
  email: string,
  code: string
): Promise<ApiResult<{ otpToken: string }>> {
  return request('/api/auth/register/verify', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), code },
  });
}

/** Step 3 — set the password; the account and the session are created together. */
export function completeRegistration(
  otpToken: string,
  password: string
): Promise<ApiResult<SessionPayload>> {
  return request('/api/auth/register/complete', {
    method: 'POST',
    body: { otpToken, password },
  });
}

export function login(email: string, password: string): Promise<ApiResult<SessionPayload>> {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), password },
  });
}

/** Asks the server whether a stored token is still good. */
export function fetchMe(token: string): Promise<ApiResult<{ user: ApiUser }>> {
  return request('/api/auth/me', { token });
}

/** Rename the account. Email stays put — it is how they sign in. */
export function updateMyName(
  token: string,
  name: string
): Promise<ApiResult<{ user: ApiUser }>> {
  return request('/api/auth/me', { method: 'PATCH', body: { name: name.trim() }, token });
}

export function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<ApiResult<void>> {
  return request('/api/auth/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
    token,
  });
}

/** Closes the account after the password is confirmed. */
export function deleteMyAccount(token: string, password: string): Promise<ApiResult<void>> {
  return request('/api/auth/me', { method: 'DELETE', body: { password }, token });
}

export function logout(token: string): Promise<ApiResult<void>> {
  return request('/api/auth/logout', { method: 'POST', token });
}
