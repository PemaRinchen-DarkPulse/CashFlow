import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { BackButton } from '@/src/components/BackButton';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { withAlpha } from '@/src/components/CategoryIcon';
import { DateField } from '@/src/components/DateField';
import { NoAccountsNotice } from '@/src/components/NoAccountsNotice';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { Segmented } from '@/src/components/Segmented';
import { SuccessOverlay } from '@/src/components/SuccessOverlay';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { TransactionKind } from '@/src/types';
import { isSameDay } from '@/src/utils/date';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

/**
 * Keep the logged time realistic: something entered today happened just now, so
 * it takes the current clock. A day picked from the calendar has no time of its
 * own, so it lands at noon — far enough from either midnight boundary that a
 * timezone shift cannot slide it onto the wrong day.
 */
function stampTime(day: Date): Date {
  const now = new Date();
  if (isSameDay(day, now)) return now;
  const date = new Date(day);
  date.setHours(12, 0, 0, 0);
  return date;
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
  const [date, setDate] = useState(() => new Date());
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ amount: number; title: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const available = useMemo(
    () => categories.filter((category) => category.kind === kind),
    [categories, kind]
  );

  // The list is read back from the server, so it can arrive after this screen is
  // already open — and an account can be removed from the profile while it is.
  useEffect(() => {
    if (accounts.some((account) => account.id === accountId)) return;
    setAccountId(accounts[0]?.id ?? '');
  }, [accounts, accountId]);

  const selectedCategory = available.find((category) => category.id === categoryId);
  const parsedAmount = Number(amount);
  // Without an account there is nothing to move the money out of, so saving is
  // held back until one exists rather than booking against an account that does
  // not.
  const valid =
    Number.isFinite(parsedAmount) && parsedAmount > 0 && !!selectedCategory && accounts.length > 0;

  const hasExplicitKind = params.kind === 'income' || params.kind === 'expense';
  /** The one colour that says which way the money is going. */
  const tone = kind === 'income' ? colors.income : colors.expense;

  const switchKind = (next: TransactionKind) => {
    setKind(next);
    setCategoryId(null);
  };

  const reset = () => {
    setAmount('');
    setTitle('');
    setNote('');
    setCategoryId(null);
    setDate(new Date());
    setSaved(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!valid || !selectedCategory || saving) return;

    setSaving(true);
    setSaveError(null);

    const recordedTitle = title.trim() || selectedCategory.name;
    const recordedAmount = parsedAmount;

    const res = await addTransaction({
      title: recordedTitle,
      categoryId: selectedCategory.id,
      amount: recordedAmount,
      kind,
      date: stampTime(date).toISOString(),
      note,
      accountId,
    });

    setSaving(false);
    if (!res.ok) {
      setSaveError(res.message);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved({ amount: recordedAmount, title: recordedTitle });
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
            // The same control as the back button, wearing a cross, so the two
            // corners of the header match.
            right={<BackButton variant="close" onPress={close} />}
            showBack={false}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          <NoAccountsNotice
            title="Add an account first"
            body={`Every ${kind === 'income' ? 'payment in' : 'expense'} is recorded against an account, and you do not have one yet.`}
          />

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

          {/*
            Amount. The direction is carried by colour and a named badge rather
            than by a +/- glyph: a lone sign in front of a number is easy to
            miss at a glance and says nothing about which way the money is
            moving. The whole card is tinted, so what is being entered is
            obvious from anywhere on the screen, and it recolours the instant
            the Expense/Income switch is touched.
          */}
          <Card
            style={[
              styles.amountCard,
              { backgroundColor: withAlpha(tone, 0.07), borderColor: withAlpha(tone, 0.32) },
            ]}>
            <View
              style={[
                styles.kindBadge,
                { backgroundColor: withAlpha(tone, 0.16), borderColor: withAlpha(tone, 0.34) },
              ]}>
              <Ionicons
                name={kind === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={14}
                color={tone}
              />
              <AppText variant="label" color={tone}>
                {kind === 'income' ? 'Money in' : 'Money out'}
              </AppText>
            </View>

            <View style={styles.amountRow}>
              <AppText style={[styles.currency, { color: tone }]}>{profile.currency}</AppText>
              <TextInput
                value={amount}
                onChangeText={(text) => setAmount(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                style={[styles.amountInput, { color: tone }]}
                autoFocus
              />
            </View>
          </Card>

          {/* Category */}
          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
              Category
            </AppText>
            {/*
              One row that scrolls sideways rather than a grid that grows
              downwards. The grid cost four rows before a word was typed and
              gained another with every category added, pushing the amount off
              screen; this stays one row tall however long the list gets, and
              still shows the categories themselves rather than hiding them
              behind a tap.
            */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}>
              {available.map((category) => {
                const selected = category.id === categoryId;
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setCategoryId(category.id)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      // Selected takes the category's own colour, so the choice
                      // is legible at a glance in a row of otherwise grey pills.
                      selected && {
                        backgroundColor: withAlpha(category.color, 0.16),
                        borderColor: withAlpha(category.color, 0.42),
                      },
                      pressed && !selected && { backgroundColor: colors.surfaceHigh },
                    ]}>
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={selected ? category.color : colors.textMuted}
                    />
                    <AppText
                      variant="label"
                      color={selected ? colors.text : colors.textSecondary}
                      numberOfLines={1}>
                      {category.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
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
              <DateField
                value={date}
                onChange={setDate}
                accessibilityLabel={
                  kind === 'income' ? 'Date this came in' : 'Date this was spent'
                }
              />
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
            <View>
              <AppText variant="caption" color={colors.textMuted} center>
                {kind === 'income' ? 'Adding' : 'Deducting'}{' '}
                {formatCurrency(parsedAmount, profile.currency)} {kind === 'income' ? 'to' : 'from'}{' '}
                {accounts.find((account) => account.id === accountId)?.name ?? 'your account'}
              </AppText>
            </View>
          ) : null}

          <Button
            label={
              saving
                ? 'Saving…'
                : kind === 'income'
                  ? 'Save income'
                  : 'Save expense'
            }
            icon="checkmark-circle"
            onPress={handleSave}
            loading={saving}
            disabled={!valid || saving}
          />
          {saveError ? (
            <AppText variant="caption" color={colors.expense} center>
              {saveError}
            </AppText>
          ) : null}
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
  amountCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  kindBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  currency: {
    fontFamily: font.bold,
    fontSize: 24,
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
  categoryRow: {
    gap: spacing.sm,
    // Lets the last chip clear the edge, so a partly visible one at the right
    // is the cue that the row keeps going.
    paddingRight: spacing.xl,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
