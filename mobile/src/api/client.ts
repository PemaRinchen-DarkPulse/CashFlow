/**
 * The one place the app talks to the network.
 *
 * Every call resolves — nothing here throws — because each caller turns the
 * result straight into either a screen transition or a toast, and a rejected
 * promise would just be a try/catch at every site doing the same mapping.
 */

import Constants from 'expo-constants';

/**
 * The API a released build talks to. Preview deploys get a new host every
 * ship; this is the stable one.
 */
const RELEASED_API_URL = 'https://cash-flow-server-fawn.vercel.app';

/**
 * Where the server is.
 *
 * While Metro is running (`__DEV__`), the phone uses the same machine that
 * served the bundle — never `localhost`, which on a phone is the phone itself.
 * The port is the one the local API listens on.
 *
 * An installed APK / TestFlight build has no Metro, so it uses the Vercel
 * deployment. `EXPO_PUBLIC_API_URL` can override that for a one-off release.
 *
 * `expo start --tunnel` still cannot reach a local API: the tunnel forwards
 * Metro only.
 */
function resolveBaseUrl(): string {
  if (!__DEV__) {
    const released = process.env.EXPO_PUBLIC_API_URL || RELEASED_API_URL;
    return released.replace(/\/+$/, '');
  }

  // Shaped like "192.168.0.95:8081" — Metro's port, which is not the API's.
  // Bracketed IPv6 keeps its brackets; only a trailing ":port" comes off.
  const host = Constants.expoConfig?.hostUri?.match(/^(\[[^\]]+\]|[^:/]+)/)?.[1];
  const port = process.env.EXPO_PUBLIC_API_PORT || '5000';
  if (!host) return '';

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

  /**
   * A multipart body is passed through untouched. `fetch` writes its own
   * Content-Type for FormData, including the boundary that separates the parts
   * — setting one by hand omits that boundary and the server reads the whole
   * body as a single malformed part.
   */
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

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
        ...(body && !isForm ? { 'content-type': 'application/json' } : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
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
