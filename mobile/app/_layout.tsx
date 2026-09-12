// Imported per weight rather than from the package root: the barrel `require`s
// all 18 Inter faces (~6 MB of .ttf), of which this app uses five.
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/src/components/Toast';
import { AuthProvider, useAuth } from '@/src/store/AuthContext';
import { FinanceProvider } from '@/src/store/FinanceContext';
import { colors } from '@/src/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * `Stack.Protected` keeps the signed-out and signed-in halves of the app
 * mutually exclusive, so the dashboard is never mounted — not even for a frame
 * — before someone has signed in.
 */
function RootNavigator() {
  const { status } = useAuth();
  const signedIn = status === 'signedIn';

  useEffect(() => {
    // The keychain read is quick, but the splash stays up until it lands so the
    // login screen never flashes in front of an already-signed-in user.
    if (status !== 'loading') SplashScreen.hideAsync().catch(() => {});
  }, [status]);

  // Same reasoning as above: the keychain read is quick, but a blank frame in
  // the middle of it would still be a white one.
  if (status === 'loading') return <View style={styles.root} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'none',
      }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-goal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-debt" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-debt" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-budget" options={{ presentation: 'modal' }} />
        <Stack.Screen name="transaction/[id]" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="about" />
      </Stack.Protected>

      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  /**
   * Painted rather than left empty. Returning `null` here mounts nothing at
   * all, so for as long as the fonts take there is no view of ours on screen
   * and the host's own white root shows through — which is the flash of white
   * between the splash and the first screen.
   */
  if (!loaded && !error) return <View style={styles.root} />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ToastProvider>
          <AuthProvider>
            <FinanceProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </FinanceProvider>
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  /** The app's canvas, held under every state the root can be in. */
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
