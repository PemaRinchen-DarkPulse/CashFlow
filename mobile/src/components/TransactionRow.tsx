import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { colors, font, spacing } from '@/src/theme';
import type { Category, Transaction } from '@/src/types';
import { formatTransactionDate } from '@/src/utils/date';
import { formatSigned, maskAmount } from '@/src/utils/format';

export type TransactionRowProps = {
  transaction: Transaction;
  category: Category;
  currency: string;
  onPress?: () => void;
  hidden?: boolean;
};

export function TransactionRow({
  transaction,
  category,
  currency,
  onPress,
  hidden = false,
}: TransactionRowProps) {
  const isIncome = transaction.kind === 'income';
  const amount = formatSigned(transaction.amount, transaction.kind, currency);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <CategoryIcon icon={category.icon} color={category.color} size={44} />

      <View style={styles.middle}>
        <AppText variant="h3" numberOfLines={1}>
          {transaction.title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
          {category.name}
        </AppText>
      </View>

      <View style={styles.right}>
        <AppText
          tabular
          style={[styles.amount, { color: isIncome ? colors.income : colors.text }]}
          numberOfLines={1}>
          {hidden ? maskAmount(amount) : amount}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
          {formatTransactionDate(transaction.date)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  middle: {
    flex: 1,
    gap: 3,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
  },
  amount: {
    fontFamily: font.semibold,
    fontSize: 15,
    letterSpacing: -0.3,
  },
});
