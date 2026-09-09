import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Credentials live in the OS keychain / keystore. SecureStore has no web
 * implementation, so the web build falls back to AsyncStorage — the same place
 * the ledger already lives, and only ever used for the local demo target.
 */
const useKeychain = Platform.OS !== 'web';

export async function readSecret(key: string): Promise<string | null> {
  try {
    return useKeychain ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(key);
  } catch {
    // A locked or unreadable keychain reads as "no account", never a crash.
    return null;
  }
}

export async function writeSecret(key: string, value: string): Promise<void> {
  if (useKeychain) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}

export async function deleteSecret(key: string): Promise<void> {
  try {
    if (useKeychain) await SecureStore.deleteItemAsync(key);
    else await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}
