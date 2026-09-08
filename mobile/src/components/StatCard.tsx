import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, font, radius, spacing } from '@/src/theme';

export type StatCardProps = {
  label: string;
  value: string;
  /** Small delta line under the value, e.g. "Net Nu. 3,686". */
  caption?: string;
  /** Tints the figure — green for money in, red for money out. */
  valueColor?: string;
  style?: ViewStyle;
};

/** A compact figure card: label, the number, and an optional footnote. */
export function StatCard({
  label,
  value,
  caption,
  valueColor = colors.text,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
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
      {caption ? (
        <AppText variant="caption" color={colors.textSecondary}>
          {caption}
        </AppText>
      ) : null}
    </View>
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
  label: {
    marginBottom: 1,
  },
  value: {
    fontFamily: font.bold,
    fontSize: 19,
    letterSpacing: -0.5,
  },
});
