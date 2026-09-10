import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Skeleton } from '@/src/components/Skeleton';
import { colors, font, radius, spacing } from '@/src/theme';

export type StatCardProps = {
  label: string;
  value: string;
  /** Small delta line under the value, e.g. "Net Nu. 3,686". */
  caption?: string;
  /** Tints the figure — green for money in, red for money out. */
  valueColor?: string;
  style?: ViewStyle;
  /**
   * Replaces the caption with a prompt and makes the whole card tappable. Set
   * this when the figure is a zero or a dash, so a card with nothing in it says
   * what to do about that rather than leaving the reader at a dead end.
   */
  actionLabel?: string;
  onAction?: () => void;
  /** Shows the card's shape while the figure is still being fetched. */
  loading?: boolean;
};

/** A compact figure card: label, the number, and an optional footnote. */
export function StatCard({
  label,
  value,
  caption,
  valueColor = colors.text,
  style,
  actionLabel,
  onAction,
  loading = false,
}: StatCardProps) {
  // A card mid-fetch is never also an invitation to act on what it holds.
  const actionable = !loading && !!actionLabel && !!onAction;

  if (loading) {
    return (
      <View style={[styles.card, style]}>
        <AppText variant="caption" color={colors.textMuted} style={styles.label}>
          {label}
        </AppText>
        {/* Sized to the figure and footnote they stand in for, so the card does
            not change height when the real ones arrive. */}
        <Skeleton width="72%" height={19} />
        <Skeleton width="46%" height={11} style={styles.loadingCaption} />
      </View>
    );
  }

  const body = (
    <>
      <AppText variant="caption" color={colors.textMuted} style={styles.label}>
        {label}
      </AppText>
      <AppText
        tabular
        style={[styles.value, { color: valueColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {value}
      </AppText>
      {actionable ? (
        <View style={styles.action}>
          <AppText variant="caption" color={colors.primary} numberOfLines={1} style={styles.flex}>
            {actionLabel}
          </AppText>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
        </View>
      ) : caption ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {caption}
        </AppText>
      ) : null}
    </>
  );

  if (!actionable) return <View style={[styles.card, style]}>{body}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${actionLabel}`}
      onPress={onAction}
      style={({ pressed }) => [
        styles.card,
        // Tinted so an empty card reads as an invitation rather than as a
        // figure that failed to load.
        styles.cardActionable,
        pressed && { backgroundColor: colors.surfaceHigh },
        style,
      ]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 2,
  },
  cardActionable: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.primarySoft,
  },
  label: {
    marginBottom: 1,
  },
  value: {
    fontFamily: font.bold,
    fontSize: 19,
    letterSpacing: -0.5,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingCaption: {
    marginTop: 3,
  },
  flex: {
    flexShrink: 1,
  },
});
