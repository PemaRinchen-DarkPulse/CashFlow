/**
 * Design tokens for the CashFlow app.
 * Dark, near-black navy canvas with a single vivid green accent.
 */

export const colors = {
  /** Page canvas */
  bg: '#05090B',
  /** Slightly lifted canvas used behind sheets and headers */
  bgElevated: '#0A1014',
  /** Default card surface */
  card: '#101A1F',
  /** Nested surface inside a card (icon pills, inputs, rows) */
  surface: '#17242B',
  /** Highest surface, used for pressed states and chips */
  surfaceHigh: '#1E2E37',

  primary: '#1DD75B',
  primaryDark: '#12A346',
  /** 14% primary — tints, glows, selected chips */
  primarySoft: 'rgba(29, 215, 91, 0.14)',
  primaryEdge: 'rgba(29, 215, 91, 0.35)',

  text: '#FFFFFF',
  textSecondary: '#9BA7B4',
  textMuted: '#65727E',

  income: '#1DD75B',
  expense: '#FF5C6C',
  expenseSoft: 'rgba(255, 92, 108, 0.14)',
  warning: '#FFB020',
  warningSoft: 'rgba(255, 176, 32, 0.14)',
  info: '#4DA3FF',

  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  overlay: 'rgba(2, 6, 8, 0.82)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 34,
  pill: 999,
} as const;

/** Inter, loaded in the root layout. */
export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: font.extrabold, fontSize: 38, letterSpacing: -1.2 },
  h1: { fontFamily: font.bold, fontSize: 26, letterSpacing: -0.6 },
  h2: { fontFamily: font.semibold, fontSize: 19, letterSpacing: -0.3 },
  h3: { fontFamily: font.semibold, fontSize: 16, letterSpacing: -0.2 },
  body: { fontFamily: font.regular, fontSize: 14.5 },
  bodyMedium: { fontFamily: font.medium, fontSize: 14.5 },
  label: { fontFamily: font.medium, fontSize: 12.5 },
  caption: { fontFamily: font.regular, fontSize: 11.5 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
} as const;

/** Palette used for category chips and chart series. */
export const chartPalette = [
  '#1DD75B',
  '#4DA3FF',
  '#FFB020',
  '#FF5C6C',
  '#A78BFA',
  '#2DD4BF',
  '#F472B6',
  '#94A3B8',
] as const;
