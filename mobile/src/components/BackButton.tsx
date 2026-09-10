import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/src/theme';

export type BackButtonProps = {
  onPress: () => void;
  /** Swaps the arrow for a cross, for a screen that closes rather than goes back. */
  variant?: 'back' | 'close';
  accessibilityLabel?: string;
};

/** The size the button occupies in a header, exported so a spacer can match it. */
export const BACK_BUTTON_SIZE = 42;

/**
 * The circular control at the top-left of every screen that is not a tab.
 *
 * It was a rounded square holding a bare chevron, which read as one more panel
 * on a screen already made of panels. A circle is the one shape the rest of the
 * layout does not use, so it separates from the cards behind it without needing
 * a heavier border, and a full arrow states the direction that a chevron only
 * hints at.
 *
 * Pressing tints it with the app's green rather than fading it out: dimming
 * makes a control look disabled at the exact moment it is being used.
 */
export function BackButton({ onPress, variant = 'back', accessibilityLabel }: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (variant === 'close' ? 'Close' : 'Go back')}
      onPress={onPress}
      // Reaches past the circle to the corner of the screen, where thumbs
      // actually land.
      hitSlop={12}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Ionicons
        name={variant === 'close' ? 'close' : 'arrow-back'}
        size={20}
        color={colors.text}
      />
    </Pressable>
  );
}

/** Holds the button's place so a title stays centred without one. */
export function BackButtonSpacer() {
  return <View style={styles.spacer} />;
}

const styles = StyleSheet.create({
  button: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryEdge,
  },
  spacer: {
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
  },
});
