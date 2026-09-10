import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { TextField } from '@/src/components/TextField';
import { useToast } from '@/src/components/Toast';
import { useAuth } from '@/src/store/AuthContext';
import { colors, font, radius, spacing } from '@/src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { savedEmail, biometrics, biometricEnabled, signIn, signInWithBiometrics, forgetDevice } =
    useAuth();
  // Somebody has signed in on this device before, so the copy can greet them
  // back rather than pitch the app.
  const hasAccount = !!savedEmail;

  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState(savedEmail ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgetting, setForgetting] = useState(false);

  // The stored email only lands once auth finishes reading the keychain, so it
  // arrives after the first render rather than as an initial value.
  useEffect(() => {
    if (savedEmail) setEmail((current) => current || savedEmail);
  }, [savedEmail]);

  const handlePasswordSignIn = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      showToast('Enter your email and password');
      return;
    }
    setBusy(true);
    const result = await signIn(email, password);
    setBusy(false);
    if (!result.ok) {
      showToast(result.message);
      setPassword('');
    }
    // A success unmounts this screen: the root layout swaps in the tabs.
  };


  const handleBiometricSignIn = async () => {
    if (busy) return;
    const result = await signInWithBiometrics();
    if (!result.ok && result.message) showToast(result.message);
  };

  const handleForget = async () => {
    setForgetting(false);
    await forgetDevice();
    setEmail('');
    setPassword('');
  };

  return (
    <ScreenBackground>
      {/*
        No KeyboardAvoidingView on purpose. It works by shrinking the box it
        wraps, and a centred column re-centres the moment that box changes
        height — which is exactly the fields jumping up as the keyboard opens.
        With the layout left at full height the keyboard simply covers the
        bottom of the screen, and nothing on it moves. Android is held to the
        same behaviour by `softwareKeyboardLayoutMode: "pan"` in app.json,
        without which the OS resizes the window itself.
      */}
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
          <AppText variant="display" center>
            Welcome back
          </AppText>
          <AppText variant="body" color={colors.textSecondary} center>
            {hasAccount
              ? 'Sign in to pick up where your money left off.'
              : 'Create an account to start tracking every ngultrum.'}
          </AppText>
        </View>

        <View style={styles.form}>
          <TextField
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!busy}
          />

          <TextField
            ref={passwordRef}
            label="Password"
            icon="lock-closed-outline"
            password
            accessory={
              <Pressable
                accessibilityRole="button"
                onPress={() => setForgetting(true)}
                hitSlop={8}
                style={({ pressed }) => pressed && { opacity: 0.6 }}>
                <AppText variant="label" color={colors.primary}>
                  Forgot password?
                </AppText>
              </Pressable>
            }
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handlePasswordSignIn}
            editable={!busy}
          />

          <Button
            label="Sign in"
            icon="log-in-outline"
            onPress={handlePasswordSignIn}
            loading={busy}
          />
        </View>

        {biometrics.enrolled && biometricEnabled ? (
          <View style={styles.biometric}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText variant="caption" color={colors.textMuted}>
                or
              </AppText>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Scan your ${biometrics.label} to sign in`}
              onPress={handleBiometricSignIn}
              style={({ pressed }) => [styles.scan, pressed && styles.scanPressed]}>
              <View style={styles.scanRing}>
                <Ionicons
                  name="finger-print"
                  size={34}
                  color={colors.info}
                />
              </View>
              <AppText variant="caption" color={colors.textSecondary} center>
                Tap to scan your {biometrics.label.toLowerCase()}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.footer}>
          <AppText variant="caption" color={colors.textMuted}>
            {hasAccount ? 'Not your account?' : 'New to CashFlow?'}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/register')}
            hitSlop={8}
            style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <AppText style={styles.footerLink}>Create an account</AppText>
          </Pressable>
        </View>
      </View>

      <ConfirmDialog
        visible={forgetting}
        icon="key-outline"
        title="Forgot your password?"
        message="Resetting a password by email is not set up yet. What this can do is clear the saved sign-in on this phone, so you can sign in as someone else."
        detail="Your account and its data are untouched on the server."
        confirmLabel="Clear saved sign-in"
        cancelLabel="Cancel"
        onConfirm={handleForget}
        onCancel={() => setForgetting(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  /**
   * One centred column, no scroll container. Everything is a sibling here on
   * purpose: with the footer in its own pinned block, a squeeze from the
   * keyboard pushed the form over it, because React Native leaves flexShrink
   * at 0 and a too-tall child overflows rather than compressing. As a single
   * flow the column just runs off the top and bottom edges instead.
   */
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
    // The mark already carries its own padding inside a square canvas, so it
    // fills the holder edge to edge — insetting it again leaves it a speck.
    width: '100%',
    height: '100%',
  },
  form: {
    gap: spacing.lg,
  },
  biometric: {
    gap: spacing.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  scan: {
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  scanPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  /** The soft halo bleeding out from the ring — the neon look. */
  scanRing: {
    width: 66,
    height: 66,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.info,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
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
