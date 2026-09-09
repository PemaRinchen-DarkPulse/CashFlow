/**
 * The one place the app talks to the network.
 *
 * Every call resolves — nothing here throws — because each caller turns the
 * result straight into either a screen transition or a toast, and a rejected
 * promise would just be a try/catch at every site doing the same mapping.
 */

import Constants from 'expo-constants';

/**
 * Where the server is, worked out rather than written down.
 *
 * A LAN IP in .env goes stale the moment the router hands this machine a new
 * lease, and "localhost" is the phone itself, so neither can be committed. But
 * the phone already knows the development machine's address — it is the host it
 * just fetched the bundle from — so the only thing left to state is the port
 * the API listens on, which is the same number the server reads as PORT.
 *
 * EXPO_PUBLIC_API_URL still wins when it is set: a released build has no
 * development server to ask, and points at a real deployment instead.
 *
 * The one case this cannot serve is `expo start --tunnel`, where the bundle
 * arrives over a public hostname that forwards Metro alone and never the API.
 */
function resolveBaseUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  // Shaped like "192.168.0.95:8081" — Metro's port, which is not the API's.
  // Bracketed IPv6 keeps its brackets; only a trailing ":port" comes off.
  const host = Constants.expoConfig?.hostUri?.match(/^(\[[^\]]+\]|[^:/]+)/)?.[1];
  const port = process.env.EXPO_PUBLIC_API_PORT;
  if (!host || !port) return '';

  return `http://${host}:${port}`;
}

const BASE_URL = resolveBaseUrl();

/** Give up before the user does; a phone on a bad network can hang far longer. */
const TIMEOUT_MS = 15000;

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = { ok: false; code: string; message: string };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

/** Shape the server uses for every error it means the app to show. */
type ErrorBody = { error?: string; message?: string };

function failure(code: string, message: string): ApiFailure {
  return { ok: false, code, message };
}

export function isApiConfigured(): boolean {
  return BASE_URL.length > 0;
}

export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<ApiResult<T>> {
  if (!BASE_URL) {
    return failure('no_base_url', 'App is not pointed at a server');
  }

  const { method = 'GET', body, token } = options;

  // React Native's AbortSignal is the `abort-controller` polyfill, which has no
  // static `timeout()`. Calling it throws a TypeError from inside the try below,
  // which is indistinguishable there from a dead server — so every request would
  // report "cannot reach the server" no matter how healthy the network is.
  // Hence the timer by hand, with a flag to tell a real timeout from a refusal.
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    // A refused connection and a timeout land here identically, and both mean
    // the same thing to someone holding a phone: the server is not answering.
    return failure(
      timedOut ? 'timeout' : 'network_error',
      timedOut ? 'Server took too long to answer' : 'Cannot reach the server'
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return { ok: true, data: undefined as T };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    // An HTML error page from a proxy, or a body that never arrived.
    return failure('bad_response', 'Server sent something unexpected');
  }

  if (!response.ok) {
    const { error, message } = (payload ?? {}) as ErrorBody;
    return failure(error ?? 'server_error', message ?? 'Something went wrong');
  }

  return { ok: true, data: payload as T };
}
