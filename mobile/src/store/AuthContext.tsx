import * as LocalAuthentication from 'expo-local-authentication';
import { Image } from 'expo-image';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import {
  fetchMe,
  login as loginRequest,
  logout as logoutRequest,
  type ApiUser,
  type SessionPayload,
} from '@/src/api/authApi';
import { deleteSecret, readSecret, writeSecret } from '@/src/store/authStorage';

const SESSION_KEY = 'cashflow.auth.session.v2';
/** The password, kept only while biometric sign-in is switched on. */
const BIOMETRIC_SECRET_KEY = 'cashflow.auth.biometric.v2';

/**
 * How long launch waits on the profile photos before giving up on them.
 *
 * A stalled picture must not hold the session back — that turns "loading" into
 * its own kind of broken. Past this the account is handed over and initials
 * stand in until the cache catches up.
 */
const PROFILE_IMAGE_WARM_MS = 4000;

async function warmProfileImages(user: ApiUser): Promise<void> {
  const urls = [user.avatar, user.cover].filter((url): url is string => !!url);
  if (urls.length === 0) return;
  await Promise.race([
    Promise.all(urls.map((url) => Image.prefetch(url).catch(() => false))),
    new Promise((resolve) => setTimeout(resolve, PROFILE_IMAGE_WARM_MS)),
  ]);
}

export type AuthAccount = ApiUser;

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

export type AuthResult = { ok: true } | { ok: false; message: string };

export type BiometricSupport = {
  /** Hardware exists *and* the user has a face/finger enrolled. */
  enrolled: boolean;
  /**
   * "Fingerprint", "Face ID", … — used verbatim in button labels. The UI draws
   * a fingerprint either way; only the wording follows the hardware, so a
   * face-only phone is not told to press a finger to a sensor it lacks.
   */
  label: string;
};

const NO_BIOMETRICS: BiometricSupport = { enrolled: false, label: 'Biometrics' };

/** What is held on the device between launches. */
type StoredSession = {
  token: string;
  expiresAt: string;
  user: ApiUser;
  /** Last email to sign in here, so the login screen can prefill it. */
  email: string;
};

function isExpired(session: StoredSession): boolean {
  return new Date(session.expiresAt).getTime() <= Date.now();
}

async function readSession(): Promise<StoredSession | null> {
  const raw = await readSecret(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    return parsed?.token && parsed?.expiresAt ? parsed : null;
  } catch {
    return null;
  }
}

async function detectBiometrics(): Promise<BiometricSupport> {
  if (Platform.OS === 'web') return NO_BIOMETRICS;
  try {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    if (!hasHardware || !isEnrolled) return NO_BIOMETRICS;

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    // Fingerprint is checked first: a phone offering both should say the thing
    // the sign-in screen actually draws.
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return { enrolled: true, label: Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint' };
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return { enrolled: true, label: Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock' };
    }
    return { ...NO_BIOMETRICS, enrolled: true };
  } catch {
    return NO_BIOMETRICS;
  }
}

/** Maps the module's error codes onto something worth putting on screen. */
function biometricMessage(error: string | undefined, label: string): string | null {
  switch (error) {
    case 'user_cancel':
    case 'app_cancel':
    case 'system_cancel':
      return null; // The user backed out on purpose — say nothing.
    case 'lockout':
      return 'Too many attempts — use your password';
    case 'not_enrolled':
    case 'passcode_not_set':
      return `Set up ${label} on this device first`;
    default:
      return `${label} did not match`;
  }
}

type AuthContextValue = {
  status: AuthStatus;
  account: AuthAccount | null;
  /** The bearer token, for calls this context does not make itself. */
  token: string | null;
  /** Email of the last account to sign in here, so login can pre-fill it. */
  savedEmail: string | null;
  biometrics: BiometricSupport;
  /** Biometric sign-in is supported *and* switched on for this device. */
  biometricEnabled: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  /** Finishes sign-up: the server hands back a session with the new account. */
  adoptSession: (session: SessionPayload) => Promise<void>;
  signInWithBiometrics: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Turning it on needs the password — it is what gets stored to sign in with. */
  enableBiometrics: (password: string) => Promise<AuthResult>;
  disableBiometrics: () => Promise<void>;
  /**
   * Wipes every trace of the last account from this device: session, stored
   * password and the remembered email. The account itself is untouched on the
   * server — this is for handing the phone over or switching accounts.
   */
  forgetDevice: () => Promise<void>;
  /**
   * The account the server just confirmed — after a photo upload, or a name
   * change. Pictures are warmed before this lands, so the header never draws
   * a hole where a face should be.
   */
  replaceAccount: (user: ApiUser) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<StoredSession | null>(null);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [biometrics, setBiometrics] = useState<BiometricSupport>(NO_BIOMETRICS);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const persist = useCallback(async (next: StoredSession) => {
    await writeSecret(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    setSavedEmail(next.email);
    setStatus('signedIn');
  }, []);

  useEffect(() => {
    (async () => {
      const [stored, secret, support] = await Promise.all([
        readSession(),
        readSecret(BIOMETRIC_SECRET_KEY),
        detectBiometrics(),
      ]);
      if (!mounted.current) return;

      setBiometrics(support);
      setBiometricEnabled(!!secret && support.enrolled);
      setSavedEmail(stored?.email ?? null);

      // Nothing stored, or the day is up: straight to the sign-in screen.
      if (!stored || isExpired(stored)) {
        if (stored) await deleteSecret(SESSION_KEY);
        if (mounted.current) setStatus('signedOut');
        return;
      }

      // The token looks live, but only the server can settle it — it may have
      // been signed with a secret that has since changed, or belong to an
      // account that is gone. Trust it while the check runs, so a flaky network
      // on launch does not throw someone out to the login screen.
      setSession(stored);
      setStatus('signedIn');

      const result = await fetchMe(stored.token);
      if (!mounted.current) return;
      if (result.ok) {
        // Fresh signed photo links, and a name that may have changed elsewhere.
        await warmProfileImages(result.data.user);
        if (!mounted.current) return;
        await persist({ ...stored, user: result.data.user });
        return;
      }
      if (result.code !== 'network_error' && result.code !== 'timeout') {
        await deleteSecret(SESSION_KEY);
        if (!mounted.current) return;
        setSession(null);
        setStatus('signedOut');
      }
    })();
  }, []);

  const adoptSession = useCallback(
    async (payload: SessionPayload) => {
      await warmProfileImages(payload.user);
      await persist({
        token: payload.token,
        expiresAt: payload.expiresAt,
        user: payload.user,
        email: payload.user.email,
      });
    },
    [persist]
  );

  const replaceAccount = useCallback(
    async (user: ApiUser) => {
      if (!session) return;
      await warmProfileImages(user);
      await persist({ ...session, user, email: user.email });
    },
    [persist, session]
  );

  const signIn = useCallback<AuthContextValue['signIn']>(
    async (email, password) => {
      const result = await loginRequest(email, password);
      if (!result.ok) return { ok: false, message: result.message };
      await adoptSession(result.data);
      return { ok: true };
    },
    [adoptSession]
  );

  const signInWithBiometrics = useCallback<AuthContextValue['signInWithBiometrics']>(async () => {
    if (!biometricEnabled) return { ok: false, message: 'Turn this on in Profile first' };

    const scan = await LocalAuthentication.authenticateAsync({
      promptMessage: `Sign in with ${biometrics.label}`,
      fallbackLabel: 'Use device passcode',
      cancelLabel: 'Use password',
    });
    if (!scan.success) {
      const message = biometricMessage(scan.error, biometrics.label);
      return { ok: false, message: message ?? '' };
    }

    const password = await readSecret(BIOMETRIC_SECRET_KEY);
    if (!savedEmail || !password) {
      return { ok: false, message: 'Sign in with your password once more' };
    }

    // The scan only unlocks the stored password; the server still decides.
    const result = await loginRequest(savedEmail, password);
    if (!result.ok) {
      // A password changed elsewhere makes the stored one useless — drop it
      // rather than leave a button that can only ever fail.
      if (result.code === 'bad_credentials') {
        await deleteSecret(BIOMETRIC_SECRET_KEY);
        setBiometricEnabled(false);
        return { ok: false, message: 'Password changed — sign in again' };
      }
      return { ok: false, message: result.message };
    }

    await adoptSession(result.data);
    return { ok: true };
  }, [biometricEnabled, biometrics.label, savedEmail, adoptSession]);

  const signOut = useCallback(async () => {
    // Tell the server, but never hold the sign-out up waiting for it.
    if (session?.token) logoutRequest(session.token).catch(() => {});
    await deleteSecret(SESSION_KEY);
    setSession(null);
    setStatus('signedOut');
  }, [session]);

  const enableBiometrics = useCallback<AuthContextValue['enableBiometrics']>(
    async (password) => {
      if (!biometrics.enrolled) {
        return { ok: false, message: 'No biometrics enrolled on this device' };
      }
      if (!savedEmail) return { ok: false, message: 'Sign in first' };

      // Check the password against the server before storing it, so a typo
      // cannot become the thing the sensor unlocks.
      const check = await loginRequest(savedEmail, password);
      if (!check.ok) {
        return {
          ok: false,
          message: check.code === 'bad_credentials' ? 'Wrong password' : check.message,
        };
      }

      const scan = await LocalAuthentication.authenticateAsync({
        promptMessage: `Turn on ${biometrics.label} sign-in`,
        cancelLabel: 'Not now',
      });
      if (!scan.success) {
        const message = biometricMessage(scan.error, biometrics.label);
        return { ok: false, message: message ?? '' };
      }

      await writeSecret(BIOMETRIC_SECRET_KEY, password);
      setBiometricEnabled(true);
      // That check minted a fresh session; keep it rather than the older one.
      await adoptSession(check.data);
      return { ok: true };
    },
    [biometrics, savedEmail, adoptSession]
  );

  const disableBiometrics = useCallback(async () => {
    await deleteSecret(BIOMETRIC_SECRET_KEY);
    setBiometricEnabled(false);
  }, []);

  const forgetDevice = useCallback(async () => {
    await Promise.all([deleteSecret(SESSION_KEY), deleteSecret(BIOMETRIC_SECRET_KEY)]);
    setSession(null);
    setSavedEmail(null);
    setBiometricEnabled(false);
    setStatus('signedOut');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      account: session?.user ?? null,
      token: session?.token ?? null,
      savedEmail,
      biometrics,
      biometricEnabled,
      signIn,
      adoptSession,
      signInWithBiometrics,
      signOut,
      enableBiometrics,
      disableBiometrics,
      forgetDevice,
      replaceAccount,
    }),
    [
      status,
      session,
      savedEmail,
      biometrics,
      biometricEnabled,
      signIn,
      adoptSession,
      signInWithBiometrics,
      signOut,
      enableBiometrics,
      disableBiometrics,
      forgetDevice,
      replaceAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

export { MIN_PASSWORD_LENGTH } from '@/src/api/authApi';

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
