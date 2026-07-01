import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Role } from '@/src/theme/theme';

const KEYS = {
  SELECTED_ROLE: '@bhutan_epis_role',
  ONBOARDING_COMPLETE: '@bhutan_epis_onboarding',
} as const;

/**
 * Get the persisted role selection
 */
export async function getSelectedRole(): Promise<Role | null> {
  try {
    const role = await AsyncStorage.getItem(KEYS.SELECTED_ROLE);
    if (role === 'patient' || role === 'doctor' || role === 'pharmacist') {
      return role;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save a role selection to persistent storage
 */
export async function setSelectedRole(role: Role): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SELECTED_ROLE, role);
  } catch (error) {
    console.error('Failed to save role:', error);
  }
}

/**
 * Clear the persisted role selection
 */
export async function clearRole(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.SELECTED_ROLE);
  } catch (error) {
    console.error('Failed to clear role:', error);
  }
}

/**
 * Check if onboarding has been completed
 */
export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark onboarding as completed
 */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  } catch (error) {
    console.error('Failed to save onboarding status:', error);
  }
}

/**
 * Reset all app data (for switching roles or logging out)
 */
export async function resetAppData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.SELECTED_ROLE, KEYS.ONBOARDING_COMPLETE]);
  } catch (error) {
    console.error('Failed to reset app data:', error);
  }
}
