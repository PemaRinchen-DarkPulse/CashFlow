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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { Card } from '@/src/components/Card';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { Segmented } from '@/src/components/Segmented';
import { SuccessOverlay } from '@/src/components/SuccessOverlay';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Debt } from '@/src/types';
import { addDays, formatDayHeading } from '@/src/utils/date';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

type Direction = Debt['direction'];

export default function AddDebtScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ direction?: string }>();
  const { state, addDebt, totalBalance } = useFinance();
  const { accounts, profile, debts } = state;
  const currency = profile.currency;

  const [direction, setDirection] = useState<Direction>(
    params.direction === 'lent' ? 'lent' : 'borrowed'
  );
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dayOffset, setDayOffset] = useState(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? 'acc-everyday');
  const [saved, setSaved] = useState<{ person: string; amount: number } | null>(null);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), -i)), []);

  /** People already on record, so repeat lenders are one tap away. */
  const knownPeople = useMemo(
    () => [...new Set(debts.map((debt) => debt.person))].slice(0, 6),
    [debts]
  );

  const parsed = Number(amount);
  const borrowed = direction === 'borrowed';
  const amountValid = Number.isFinite(parsed) && parsed > 0;
  // You cannot lend out more cash than you actually hold.
  const withinBalance = borrowed || parsed <= totalBalance;
  const valid = person.trim().length > 0 && amountValid && withinBalance;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/goals', params: { tab: 'debts' } });
  };

  const save = () => {
    if (!valid) return;
    const date = addDays(new Date(), -dayOffset);
    if (dayOffset > 0) date.setHours(12, 0, 0, 0);

    addDebt({
      person,
      direction,
      principal: parsed,
      date: date.toISOString(),
      note,
      accountId,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved({ person: person.trim(), amount: parsed });
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader
            title={borrowed ? 'Borrow money' : 'Lend money'}
            subtitle={borrowed ? 'Money a friend gave you' : 'Money you gave a friend'}
            onBack={close}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          <Segmented
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'borrowed', label: 'I borrowed' },
              { value: 'lent', label: 'I lent' },
            ]}
          />

          <Card style={styles.amountCard}>
            <AppText variant="label" color={colors.textMuted}>
              Amount
            </AppText>
            <View style={styles.amountRow}>
              <AppText style={styles.currency}>{currency}</AppText>
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
            <AppText variant="caption" color={colors.textMuted} center>
              {borrowed
                ? 'Added to your balance — recorded as a debt, not income.'
                : 'Taken from your balance — recorded as money owed to you.'}
            </AppText>
          </Card>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              {borrowed ? 'Borrowed from' : 'Lent to'}
            </AppText>
            <TextInput
              value={person}
              onChangeText={setPerson}
              placeholder="Friend's name"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            {knownPeople.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.peopleRow}>
                {knownPeople.map((name) => (
                  <Pressable
                    key={name}
                    accessibilityRole="button"
                    onPress={() => setPerson(name)}
                    style={({ pressed }) => [styles.person, pressed && { opacity: 0.7 }]}>
                    <Ionicons name="person" size={13} color={colors.textMuted} />
                    <AppText variant="label" color={colors.textSecondary}>
                      {name}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
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
                    <AppText variant="label" color={selected ? '#04140A' : colors.textSecondary}>
                      {formatDayHeading(day.toISOString())}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {accounts.length > 1 ? (
            <View>
              <AppText variant="label" color={colors.textMuted} style={styles.label}>
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
                      <AppText variant="label" color={selected ? colors.text : colors.textSecondary}>
                        {account.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              What was it for? (optional)
            </AppText>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Dinner, taxi, rent top-up…"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.noteInput]}
              multiline
            />
          </View>

          <Button
            label={borrowed ? 'Record what I borrowed' : 'Record what I lent'}
            icon="people"
            onPress={save}
            disabled={!valid}
          />

          {amountValid && !withinBalance ? (
            <AppText variant="caption" color={colors.expense} center>
              You only have {formatCurrency(totalBalance, currency)} available to lend.
            </AppText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessOverlay
        visible={!!saved}
        title={borrowed ? 'Debt Recorded!' : 'Loan Recorded!'}
        message={
          saved
            ? borrowed
              ? `You owe ${saved.person} ${formatCurrency(saved.amount, currency)}. It is tracked separately from your spending.`
              : `${saved.person} owes you ${formatCurrency(saved.amount, currency)}.`
            : ''
        }
        primaryLabel="Done"
        onPrimary={close}
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
    gap: spacing.xs,
  },
  currency: {
    fontFamily: font.bold,
    fontSize: 24,
    color: colors.textSecondary,
  },
  amountInput: {
    fontFamily: font.extrabold,
    fontSize: 42,
    letterSpacing: -1.5,
    color: colors.text,
    minWidth: 130,
    padding: 0,
  },
  label: {
    marginBottom: spacing.sm,
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
    minHeight: 72,
    textAlignVertical: 'top',
  },
  peopleRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.xl,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
