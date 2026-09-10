import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  OTP_LENGTH,
  RESEND_COOLDOWN_SECONDS,
  completeRegistration,
  startRegistration,
  verifyRegistration,
} from '@/src/api/authApi';
import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { OtpInput } from '@/src/components/OtpInput';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { TextField } from '@/src/components/TextField';
import { useToast } from '@/src/components/Toast';
import { MIN_PASSWORD_LENGTH, isValidEmail, useAuth } from '@/src/store/AuthContext';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';

type Step = 'details' | 'code' | 'password';

const COPY: Record<Step, { title: string; subtitle: string }> = {
  details: {
    title: 'Create your account',
    subtitle: 'Start with your name and the email you want to sign in with.',
  },
  code: {
    title: 'Check your email',
    subtitle: `We sent a ${OTP_LENGTH}-digit code. Enter it to prove the address is yours.`,
  },
  password: {
    title: 'Set a password',
    subtitle: 'Last step. This is what you will sign in with from now on.',
  },
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { adoptSession } = useAuth();
  const { updateProfile } = useFinance();

  const emailRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [step, setStep] = useState<Step>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  /** Proof the email was verified, spent on the final step. */
  const [otpToken, setOtpToken] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async () => {
    if (busy) return;
    if (!name.trim()) {
      showToast('Enter your name');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Enter a valid email');
      return;
    }

    setBusy(true);
    const result = await startRegistration(name, email);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setCode('');
    setStep('code');
  };

  const resendCode = async () => {
    if (busy || cooldown > 0) return;
    setBusy(true);
    const result = await startRegistration(name, email);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message);
      return;
    }
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setCode('');
    showToast('New code sent', 'success');
  };

  const checkCode = async () => {
    if (busy) return;
    if (code.length < OTP_LENGTH) {
      showToast(`Enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setBusy(true);
    const result = await verifyRegistration(email, code);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message);
      setCode('');
      return;
    }
    setOtpToken(result.data.otpToken);
    showToast('Email verified', 'success');
    setStep('password');
  };

  const finish = async () => {
    if (busy) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      showToast(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match');
      return;
    }

    setBusy(true);
    const result = await completeRegistration(otpToken, password);
    if (!result.ok) {
      setBusy(false);
      showToast(result.message);
      // The pass is single-use and short-lived; a rejection means going back
      // for a new code rather than retyping the password.
      if (result.code === 'invalid_otp_token') {
        setOtpToken('');
        setStep('details');
      }
      return;
    }
    // Keep the in-app profile card in step with the account just created.
    updateProfile(result.data.user.name, result.data.user.email);
    // Adopting the session unmounts this screen, so `busy` is left set rather
    // than writing state into a tree on its way out.
    await adoptSession(result.data);
  };

  const { title, subtitle } = COPY[step];

  return (
    <ScreenBackground>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}>
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="cover"
            />
          </View>
          <AppText variant="h1">{title}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {subtitle}
          </AppText>
          {step === 'code' ? (
            <View style={styles.emailChip}>
              <Ionicons name="mail-outline" size={13} color={colors.primary} />
              <AppText variant="caption" color={colors.text}>
                {email.trim().toLowerCase()}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.form}>
          {step === 'details' ? (
            <>
              <TextField
                label="Name"
                icon="person-outline"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                editable={!busy}
              />

              <TextField
                ref={emailRef}
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="go"
                onSubmitEditing={sendCode}
                editable={!busy}
              />
            </>
          ) : null}

          {step === 'code' ? (
            <>
              <OtpInput value={code} onChangeText={setCode} editable={!busy} />

              <Pressable
                accessibilityRole="button"
                disabled={cooldown > 0 || busy}
                onPress={resendCode}
                hitSlop={8}
                style={({ pressed }) => [styles.resend, pressed && { opacity: 0.6 }]}>
                <AppText
                  variant="caption"
                  color={cooldown > 0 ? colors.textMuted : colors.primary}>
                  {cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
                </AppText>
              </Pressable>
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <TextField
                label="Password"
                icon="lock-closed-outline"
                password
                value={password}
                onChangeText={setPassword}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                editable={!busy}
                autoFocus
                hint="It cannot be recovered, so pick one you will remember."
              />

              <TextField
                ref={confirmRef}
                label="Confirm password"
                icon="lock-closed-outline"
                password
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repeat your password"
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={finish}
                editable={!busy}
                error={confirm.length > 0 && confirm !== password}
              />
            </>
          ) : null}

          {step === 'details' ? (
            <Button
              label="Send verification code"
              icon="paper-plane-outline"
              onPress={sendCode}
              loading={busy}
            />
          ) : null}

          {step === 'code' ? (
            <Button
              label="Verify email"
              icon="checkmark-circle-outline"
              onPress={checkCode}
              loading={busy}
            />
          ) : null}

          {step === 'password' ? (
            <Button
              label="Create account"
              icon="arrow-forward"
              onPress={finish}
              loading={busy}
            />
          ) : null}

          <View style={styles.footer}>
            <AppText variant="caption" color={colors.textMuted}>
              Already have an account?
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              hitSlop={8}
              style={({ pressed }) => pressed && { opacity: 0.6 }}>
              <AppText style={styles.footerLink}>Sign in</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  emailChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryEdge,
  },
  form: {
    gap: spacing.lg,
  },
  resend: {
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerLink: {
    fontFamily: font.semibold,
    fontSize: 12.5,
    color: colors.primary,
  },
});
