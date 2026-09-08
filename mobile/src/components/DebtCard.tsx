import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ProgressBar } from '@/src/components/ProgressBar';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Debt } from '@/src/types';
import { outstandingOf } from '@/src/utils/analytics';
import { formatDate } from '@/src/utils/date';
import { formatCurrency } from '@/src/utils/format';

export type DebtCardProps = {
  debt: Debt;
  currency: string;
  onRepay?: () => void;
  onDelete?: () => void;
  delay?: number;
};

export function DebtCard({ debt, currency, onRepay, onDelete, delay = 0 }: DebtCardProps) {
  const outstanding = outstandingOf(debt);
  const settled = outstanding <= 0;
  const borrowed = debt.direction === 'borrowed';
  const progress = debt.principal === 0 ? 0 : (debt.repaid / debt.principal) * 100;
  // Owing money is the state worth flagging; money lent out is neutral.
  const tone = settled ? colors.primary : borrowed ? colors.warning : colors.info;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <CategoryIcon
          icon={settled ? 'checkmark-done' : borrowed ? 'arrow-down-circle' : 'arrow-up-circle'}
          color={tone}
          size={42}
        />

        <View style={styles.titles}>
          <AppText variant="h3" numberOfLines={1}>
            {debt.person}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {settled
              ? `Settled · ${formatDate(debt.date)}`
              : borrowed
                ? `You owe · since ${formatDate(debt.date)}`
                : `Owes you · since ${formatDate(debt.date)}`}
          </AppText>
        </View>

        <View style={styles.amounts}>
          <AppText tabular style={[styles.outstanding, settled && { color: colors.textMuted }]}>
            {formatCurrency(settled ? debt.principal : outstanding, currency, 0)}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} tabular>
            of {formatCurrency(debt.principal, currency, 0)}
          </AppText>
        </View>
      </View>

      <ProgressBar value={progress} color={settled ? colors.primary : tone} delay={delay} />

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.note}>
          {debt.note ?? `${formatCurrency(debt.repaid, currency, 0)} settled so far`}
        </AppText>

        <View style={styles.actions}>
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete record for ${debt.person}`}
              onPress={onDelete}
              hitSlop={8}
              style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}>
              <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
            </Pressable>
          ) : null}

          {onRepay && !settled ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                borrowed ? `Pay ${debt.person} back` : `Record repayment from ${debt.person}`
              }
              onPress={onRepay}
              style={({ pressed }) => [styles.repay, pressed && { opacity: 0.7 }]}>
              <Ionicons name={borrowed ? 'arrow-up' : 'arrow-down'} size={14} color={colors.primary} />
              <AppText variant="label" color={colors.primary}>
                {borrowed ? 'Pay back' : 'Received'}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
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
  outstanding: {
    fontFamily: font.bold,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  note: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryEdge,
  },
});
