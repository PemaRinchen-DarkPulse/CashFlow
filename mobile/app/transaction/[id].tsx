import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';
import { categoryOf } from '@/src/utils/analytics';
import { formatDate, formatTime } from '@/src/utils/date';
import { formatSigned } from '@/src/utils/format';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, deleteTransaction } = useFinance();
  // Declared before the not-found early return so hook order stays stable.
  const [confirming, setConfirming] = useState(false);

  const transaction = state.transactions.find((item) => item.id === id);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/transactions');
  };

  if (!transaction) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader title="Transaction" />
        </View>
        <EmptyState
          icon="receipt-outline"
          title="Transaction not found"
          body="It may have been deleted."
          actionLabel="Back to activity"
          onAction={goBack}
        />
      </ScreenBackground>
    );
  }

  const category = categoryOf(state.categories, transaction.categoryId);
  const account = state.accounts.find((item) => item.id === transaction.accountId);
  const isIncome = transaction.kind === 'income';

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setConfirming(false);
    goBack();
  };

  const rows: { label: string; value: string; icon: IconName }[] = [
    { label: 'Category', value: category.name, icon: 'pricetag-outline' },
    { label: 'Date', value: formatDate(transaction.date), icon: 'calendar-outline' },
    { label: 'Time', value: formatTime(transaction.date), icon: 'time-outline' },
    // The account can be gone while the transaction that used it remains, and
    // saying so is more use than a dash the reader has to interpret.
    { label: 'Account', value: account?.name ?? 'Account removed', icon: 'card-outline' },
    { label: 'Type', value: isIncome ? 'Income' : 'Expense', icon: 'swap-vertical-outline' },
  ];

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + spacing.md }}>
        <ScreenHeader title="Transaction" subtitle={category.name} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <View style={styles.hero}>
          <CategoryIcon icon={category.icon} color={category.color} size={72} />
          <AppText variant="h2" center numberOfLines={2} style={styles.title}>
            {transaction.title}
          </AppText>
          <AppText
            tabular
            style={[styles.amount, { color: isIncome ? colors.income : colors.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {formatSigned(transaction.amount, transaction.kind, state.profile.currency)}
          </AppText>
          <View style={styles.statusPill}>
            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
            <AppText variant="caption" color={colors.primary}>
              Completed
            </AppText>
          </View>
        </View>

        <View>
          <Card style={styles.detailCard}>
            {rows.map((row, index) => (
              <View key={row.label}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name={row.icon} size={15} color={colors.textMuted} />
                    <AppText variant="body" color={colors.textSecondary}>
                      {row.label}
                    </AppText>
                  </View>
                  <AppText variant="bodyMedium" numberOfLines={1} style={styles.detailValue}>
                    {row.value}
                  </AppText>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {transaction.note ? (
          <View>
            <Card>
              <AppText variant="label" color={colors.textMuted} style={styles.noteLabel}>
                Note
              </AppText>
              <AppText variant="body" color={colors.textSecondary} style={styles.note}>
                {transaction.note}
              </AppText>
            </Card>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            label="Delete transaction"
            variant="danger"
            icon="trash-outline"
            onPress={() => setConfirming(true)}
          />
          <Button label="Back to activity" variant="ghost" onPress={goBack} />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirming}
        title="Delete this?"
        message={`"${transaction.title}" will be removed from your records for good.`}
        detail={`Your balance will change by ${formatSigned(
          transaction.amount,
          isIncome ? 'expense' : 'income',
          state.profile.currency
        )} to undo it.`}
        confirmLabel="Yes, delete it"
        cancelLabel="Keep it"
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    marginTop: spacing.xs,
  },
  amount: {
    fontFamily: font.extrabold,
    fontSize: 38,
    letterSpacing: -1.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryEdge,
  },
  detailCard: {
    paddingVertical: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  noteLabel: {
    marginBottom: spacing.sm,
  },
  note: {
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
});
