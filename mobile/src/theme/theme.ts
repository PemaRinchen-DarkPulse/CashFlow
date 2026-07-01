/**
 * Bhutan ePIS Design System
 * Healthcare-focused theme following Material Design 3 principles
 * Light theme only — blue & white palette
 */

export const Colors = {
  // Primary
  primary: '#1565C0',
  primaryLight: '#1E88E5',
  primaryDark: '#0D47A1',
  primaryContainer: '#D1E4FF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#001D36',

  // Secondary
  secondary: '#4FC3F7',
  secondaryContainer: '#E1F5FE',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#001F2A',

  // Surface & Background
  background: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4FA',
  surfaceContainer: '#EEF2F9',
  onBackground: '#1A1C1E',
  onSurface: '#1A1C1E',
  onSurfaceVariant: '#44474E',

  // Accent
  accent: '#4FC3F7',
  accentLight: '#B3E5FC',

  // Status
  success: '#2E7D32',
  successLight: '#E8F5E9',
  warning: '#F57F17',
  warningLight: '#FFF8E1',
  error: '#C62828',
  errorLight: '#FFEBEE',
  info: '#1565C0',
  infoLight: '#E3F2FD',

  // Text
  textPrimary: '#1A1C1E',
  textSecondary: '#44474E',
  textTertiary: '#74777F',
  textDisabled: '#B0B4BC',
  textOnDark: '#FFFFFF',

  // Borders & Dividers
  border: '#E0E3E8',
  borderLight: '#F0F2F5',
  divider: '#E8EBF0',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  shimmer: '#E8EBF0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Typography = {
  // Display
  displayLarge: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  displayMedium: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.25 },
  displaySmall: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32, letterSpacing: 0 },

  // Headline
  headlineLarge: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28, letterSpacing: 0 },
  headlineMedium: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26, letterSpacing: 0 },
  headlineSmall: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, letterSpacing: 0 },

  // Title
  titleLarge: { fontSize: 18, fontWeight: '500' as const, lineHeight: 24, letterSpacing: 0.15 },
  titleMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22, letterSpacing: 0.15 },
  titleSmall: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.1 },

  // Body
  bodyLarge: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, letterSpacing: 0.5 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, letterSpacing: 0.25 },
  bodySmall: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, letterSpacing: 0.4 },

  // Label
  labelLarge: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.5 },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    borderWidth: 1,
    borderColor: '#E0E3E8', // Colors.border
    elevation: 0,
    shadowOpacity: 0,
  },
  md: {
    borderWidth: 1,
    borderColor: '#E0E3E8',
    elevation: 0,
    shadowOpacity: 0,
  },
  lg: {
    borderWidth: 1,
    borderColor: '#E0E3E8',
    elevation: 0,
    shadowOpacity: 0,
  },
  xl: {
    borderWidth: 1,
    borderColor: '#E0E3E8',
    elevation: 0,
    shadowOpacity: 0,
  },
} as const;

export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 48,
} as const;

export type Role = 'patient' | 'doctor' | 'pharmacist';
