import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
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
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { Segmented } from '@/src/components/Segmented';
import { SuccessOverlay } from '@/src/components/SuccessOverlay';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { TransactionKind } from '@/src/types';
import { addDays, formatDayHeading } from '@/src/utils/date';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

/** The last week, newest first — enough for logging things you forgot. */
function recentDays(): Date[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => addDays(now, -index));
}

export default function AddTransactionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ kind?: string }>();
  const { state, addTransaction } = useFinance();
  const { categories, profile, accounts } = state;

  const [kind, setKind] = useState<TransactionKind>(params.kind === 'income' ? 'income' : 'expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [dayOffset, setDayOffset] = useState(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 'acc-everyday');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ amount: number; title: string } | null>(null);

  const available = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind]
  );

  const days = useMemo(recentDays, []);
  const selectedCategory = available.find((category) => category.id === categoryId);
  const parsedAmount = Number(amount);
  const valid = Number.isFinite(parsedAmount) && parsedAmount > 0 && !!selectedCategory;

  const hasExplicitKind = params.kind === 'income' || params.kind === 'expense';

  const switchKind = (next: TransactionKind) => {
    setKind(next);
    setCategoryId(null);
  };

  const reset = () => {
    setAmount('');
    setTitle('');
    setNote('');
    setCategoryId(null);
    setDayOffset(0);
    setSaved(null);
  };

  const handleSave = () => {
    if (!valid || !selectedCategory) return;

    // Keep the logged time realistic: today's entries land "now", older ones at noon.
    const date = addDays(new Date(), -dayOffset);
    if (dayOffset > 0) date.setHours(12, 0, 0, 0);

    const transaction = addTransaction({
      title: title.trim() || selectedCategory.name,
      categoryId: selectedCategory.id,
      amount: parsedAmount,
      kind,
      date: date.toISOString(),
      note,
      accountId,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved({ amount: transaction.amount, title: transaction.title });
  };

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader
            title={kind === 'income' ? 'Add income' : 'Add expense'}
            subtitle="Log it while it's fresh"
            onBack={close}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={close}
                hitSlop={8}
                style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}>
                <Ionicons name="close" size={19} color={colors.text} />
              </Pressable>
            }
            showBack={false}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          {!hasExplicitKind ? (
            <Segmented
              value={kind}
              onChange={switchKind}
              options={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
            />
          ) : null}

          {/* Amount */}
          <Card style={styles.amountCard}>
            <AppText variant="label" color={colors.textMuted}>
              Amount
            </AppText>
            <View style={styles.amountRow}>
              <AppText
                style={[
                  styles.sign,
                  { color: kind === 'income' ? colors.income : colors.expense },
                ]}>
                {kind === 'income' ? '+' : '-'}
              </AppText>
              <AppText style={styles.currency}>{profile.currency}</AppText>
              <TextInput
                value={amount}
                onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                style={styles.amountInput}
                autoFocus
              />
            </View>
          </Card>

          {/* Category */}
          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
              Category
            </AppText>
            <View style={styles.categoryGrid}>
              {available.map((category) => {
                const selected = category.id === categoryId;
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setCategoryId(category.id)}
                    style={({ pressed }) => [
                      styles.categoryItem,
                      selected && styles.categoryItemSelected,
                      pressed && { opacity: 0.8 },
                    ]}>
                    <CategoryIcon
                      icon={category.icon}
                      color={category.color}
                      size={38}
                      solid={selected}
                    />
                    <AppText
                      variant="caption"
                      color={selected ? colors.text : colors.textMuted}
                      numberOfLines={1}
                      center>
                      {category.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Details */}
          <View style={styles.fields}>
            <View>
              <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
                {kind === 'income' ? 'Source' : 'Paid to'}
              </AppText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={
                  kind === 'income' ? 'Employer, client, …' : 'Shop, restaurant, bill, …'
                }
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <View>
              <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
                When
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayRow}>
                {days.map((day, index) => {
                  const selected = index === dayOffset;
                  return (
                    <Pressable
                      key={day.toISOString()}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setDayOffset(index)}
                      style={[styles.day, selected && styles.daySelected]}>
                      <AppText
                        variant="label"
                        color={selected ? '#04140A' : colors.textSecondary}
                        numberOfLines={1}>
                        {formatDayHeading(day.toISOString())}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {accounts.length > 1 ? (
              <View>
                <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
                  Account
                </AppText>
                <View style={styles.accountRow}>
                  {accounts.map((account) => {
                    const selected = account.id === accountId;
                    return (
                      <Pressable
                        key={account.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        onPress={() => setAccountId(account.id)}
                        style={[styles.account, selected && styles.accountSelected]}>
                        <Ionicons
                          name={account.icon}
                          size={15}
                          color={selected ? colors.primary : colors.textMuted}
                        />
                        <AppText
                          variant="label"
                          color={selected ? colors.text : colors.textSecondary}>
                          {account.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View>
              <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
                Note (optional)
              </AppText>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What was this for?"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.noteInput]}
                multiline
              />
            </View>
          </View>

          {valid ? (
            <Animated.View entering={FadeIn.duration(220)}>
              <AppText variant="caption" color={colors.textMuted} center>
                {kind === 'income' ? 'Adding' : 'Deducting'}{' '}
                {formatCurrency(parsedAmount, profile.currency)} {kind === 'income' ? 'to' : 'from'}{' '}
                {accounts.find((account) => account.id === accountId)?.name ?? 'your account'}
              </AppText>
            </Animated.View>
          ) : null}

          <Button
            label={kind === 'income' ? 'Save income' : 'Save expense'}
            icon="checkmark-circle"
            onPress={handleSave}
            disabled={!valid}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessOverlay
        visible={!!saved}
        title={kind === 'income' ? 'Income Added!' : 'Expense Logged!'}
        message={
          saved
            ? `${formatCurrency(saved.amount, profile.currency)} for ${saved.title} was recorded successfully.`
            : ''
        }
        primaryLabel="Done"
        onPrimary={close}
        secondaryLabel="Add another"
        onSecondary={reset}
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
  close: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sign: {
    fontFamily: font.bold,
    fontSize: 30,
  },
  currency: {
    fontFamily: font.bold,
    fontSize: 24,
    color: colors.textSecondary,
  },
  amountInput: {
    fontFamily: font.extrabold,
    fontSize: 44,
    letterSpacing: -1.6,
    color: colors.text,
    minWidth: 130,
    padding: 0,
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    backgroundColor: colors.card,
    borderColor: colors.borderStrong,
  },
  fields: {
    gap: spacing.lg,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
  },
  noteInput: {
    minHeight: 78,
    textAlignVertical: 'top',
  },
  dayRow: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  day: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  accountRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountSelected: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.primarySoft,
  },
});
