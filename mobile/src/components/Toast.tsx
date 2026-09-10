import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
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
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { colors, shadow, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';

/** How long a toast stays on screen before it clears itself. */
const TOAST_MS = 10000;

export type ToastTone = 'error' | 'success' | 'info';

type Toast = { id: number; message: string; tone: ToastTone };

/**
 * `bg` is each tint flattened at 22% over the elevated surface rather than left
 * translucent: the card floats over whatever the screen is showing, and a
 * see-through red would pick up the content behind it.
 */
const TONES: Record<ToastTone, { tint: string; bg: string; icon: IconName }> = {
  error: { tint: colors.expense, bg: '#402127', icon: 'alert-circle' },
  success: { tint: colors.primary, bg: '#0E3C24', icon: 'checkmark-circle' },
  info: { tint: colors.info, bg: '#193048', icon: 'information-circle' },
};

type ToastContextValue = {
  /** Keep the message short — the card is one or two lines wide at most. */
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * A single toast slot anchored to the top right. It appears and clears
 * outright — no slide, no fade, nothing moving — so a message is in front of
 * you the instant it happens. One at a time: a new message replaces whatever
 * is showing rather than stacking, so a run of failed attempts cannot bury the
 * screen.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const hideToast = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const showToast = useCallback<ToastContextValue['showToast']>(
    (message, tone = 'error') => {
      if (!message) return;
      clearTimer();
      setToast({ id: Date.now(), message, tone });

      if (tone === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (tone === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      timer.current = setTimeout(() => setToast(null), TOAST_MS);
    },
    [clearTimer]
  );

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);
  const tone = toast ? TONES[toast.tone] : null;

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}

        {toast && tone ? (
          <View style={[styles.anchor, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
            <View
              accessibilityRole="alert"
              accessibilityLabel={toast.message}
              style={[styles.card, { backgroundColor: tone.bg }]}>
              <View style={styles.row}>
                <Ionicons name={tone.icon} size={18} color={tone.tint} />
                <AppText
                  variant="label"
                  color={colors.text}
                  numberOfLines={2}
                  style={styles.message}>
                  {toast.message}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss"
                  onPress={hideToast}
                  hitSlop={10}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <Ionicons name="close" size={15} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={[styles.bar, { backgroundColor: tone.tint }]} />
            </View>
          </View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  anchor: {
    position: 'absolute',
    right: spacing.lg,
    // Clears the tallest thing it can land on — modals excepted, which sit in
    // their own native window anyway.
    zIndex: 100,
    elevation: 100,
  },
  card: {
    maxWidth: 300,
    // Not a radius token: the smallest is 12, and on a card this short that
    // still reads as a pill. 10 keeps the corners soft without rounding away
    // the shape.
    borderRadius: 10,
    // Keeps the accent bar inside the rounded bottom corners.
    overflow: 'hidden',
    ...shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  message: {
    flexShrink: 1,
  },
  bar: {
    height: 3,
  },
  pressed: {
    opacity: 0.85,
  },
});
