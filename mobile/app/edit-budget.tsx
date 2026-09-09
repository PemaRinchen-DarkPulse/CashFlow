import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import { budgetStatuses } from '@/src/utils/analytics';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

export default function EditBudgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const { state, setBudget, deleteBudget } = useFinance();
  const { categories, budgets, transactions, profile } = state;

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.kind === 'expense'),
    [categories]
  );

  const [categoryId, setCategoryId] = useState<string | null>(params.categoryId ?? null);
  const existing = budgets.find((budget) => budget.categoryId === categoryId);
  const [limit, setLimit] = useState(existing ? String(existing.limit) : '');
  const [removing, setRemoving] = useState(false);

  const status = useMemo(
    () =>
      categoryId
        ? budgetStatuses(budgets, transactions, categories).find(
            (item) => item.category.id === categoryId
          )
        : undefined,
    [budgets, transactions, categories, categoryId]
  );

  const parsed = Number(limit);
  const valid = !!categoryId && Number.isFinite(parsed) && parsed > 0;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/goals', params: { tab: 'budgets' } });
  };

  const save = () => {
    if (!valid || !categoryId) return;
    setBudget(categoryId, parsed);
    close();
  };

  const remove = () => {
    if (!existing) return;
    deleteBudget(existing.id);
    setRemoving(false);
    close();
  };

  const selectCategory = (id: string) => {
    setCategoryId(id);
    const current = budgets.find((budget) => budget.categoryId === id);
    setLimit(current ? String(current.limit) : '');
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader
            title={existing ? 'Edit budget' : 'New budget'}
            subtitle="Monthly spending limit"
            onBack={close}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              Category
            </AppText>
            <View style={styles.grid}>
              {expenseCategories.map((category) => {
                const selected = category.id === categoryId;
                const hasBudget = budgets.some((budget) => budget.categoryId === category.id);
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => selectCategory(category.id)}
                    style={({ pressed }) => [
                      styles.gridItem,
                      selected && styles.gridItemSelected,
                      pressed && { opacity: 0.8 },
                    ]}>
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size={36}
                      solid={selected}
                    />
                    <AppText
                      variant="caption"
                      color={selected ? colors.text : colors.textMuted}
                      numberOfLines={1}
                      center>
                      {category.name}
                    </AppText>
                    {hasBudget && !selected ? <View style={styles.hasBudgetDot} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Card style={styles.amountCard}>
            <AppText variant="label" color={colors.textMuted}>
              Monthly limit
            </AppText>
            <View style={styles.amountRow}>
              <AppText style={styles.currency}>{profile.currency}</AppText>
              <TextInput
                value={limit}
                onChangeText={(text) => setLimit(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.amountInput}
              />
            </View>

            {status ? (
              <View style={styles.currentUsage}>
                <ProgressBar
                  value={valid ? Math.min((status.spent / parsed) * 100, 100) : status.progress}
                  color={
                    valid && status.spent > parsed
                      ? colors.expense
                      : status.state === 'over'
                        ? colors.expense
                        : colors.primary
                  }
                />
                <AppText variant="caption" color={colors.textMuted}>
                  {formatCurrency(status.spent, profile.currency)} spent in this category this month
                </AppText>
              </View>
            ) : null}
          </Card>

          <View style={styles.presets}>
            {[100, 200, 350, 500].map((preset) => (
              <Pressable
                key={preset}
                accessibilityRole="button"
                onPress={() => setLimit(String(preset))}
                style={({ pressed }) => [styles.preset, pressed && { opacity: 0.7 }]}>
                <AppText variant="label" color={colors.textSecondary}>
                  {formatCurrency(preset, profile.currency, 0)}
                </AppText>
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              label={existing ? 'Update budget' : 'Create budget'}
              icon="checkmark-circle"
              onPress={save}
              disabled={!valid}
            />
            {existing ? (
              <Button
                label="Remove budget"
                variant="danger"
                icon="trash-outline"
                onPress={() => setRemoving(true)}
              />
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={removing}
        title="Remove this budget?"
        message={`The monthly limit on ${status?.category.name ?? 'this category'} will be removed.`}
        detail="Spending in it keeps being tracked — you just stop seeing a limit and warnings."
        confirmLabel="Yes, remove it"
        cancelLabel="Keep it"
        onConfirm={remove}
        onCancel={() => setRemoving(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  label: {
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gridItemSelected: {
    backgroundColor: colors.card,
    borderColor: colors.borderStrong,
  },
  hasBudgetDot: {
    position: 'absolute',
    top: spacing.md,
    right: '26%',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  amountCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  currency: {
    fontFamily: font.bold,
    fontSize: 22,
    color: colors.textSecondary,
  },
  amountInput: {
    fontFamily: font.extrabold,
    fontSize: 40,
    letterSpacing: -1.4,
    color: colors.text,
    minWidth: 110,
    padding: 0,
    textAlign: 'center',
  },
  currentUsage: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  preset: {
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});
