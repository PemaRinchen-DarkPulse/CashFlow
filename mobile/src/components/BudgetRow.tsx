import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ProgressBar } from '@/src/components/ProgressBar';
import { colors, font, spacing } from '@/src/theme';
import type { BudgetStatus } from '@/src/utils/analytics';
import { formatCurrency } from '@/src/utils/format';

export type BudgetRowProps = {
  status: BudgetStatus;
  currency: string;
  onPress?: () => void;
};

const TONE = {
  safe: colors.primary,
  warning: colors.warning,
  over: colors.expense,
} as const;

export function BudgetRow({ status, currency, onPress }: BudgetRowProps) {
  const tone = TONE[status.state];
  const over = status.remaining < 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && { opacity: 0.75 }]}>
      <View style={styles.header}>
        <CategoryIcon icon={status.category.icon} color={status.category.color} size={38} />

        <View style={styles.titles}>
          <AppText variant="h3" numberOfLines={1}>
            {status.category.name}
          </AppText>
          <AppText variant="caption" color={over ? colors.expense : colors.textMuted}>
            {over
              ? `${formatCurrency(Math.abs(status.remaining), currency)} over budget`
              : `${formatCurrency(status.remaining, currency)} left`}
          </AppText>
        </View>

        <View style={styles.amounts}>
          <AppText tabular style={styles.spent}>
            {formatCurrency(status.spent, currency, 0)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} tabular>
            of {formatCurrency(status.budget.limit, currency, 0)}
          </AppText>
        </View>
      </View>

      <ProgressBar value={status.progress} color={tone} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  amounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  spent: {
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.3,
  },
});
