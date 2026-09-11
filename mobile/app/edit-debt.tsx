import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { DateField } from '@/src/components/DateField';
import { EmptyState } from '@/src/components/EmptyState';
import { NoAccountsNotice } from '@/src/components/NoAccountsNotice';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { Segmented } from '@/src/components/Segmented';
import { SkeletonRow } from '@/src/components/Skeleton';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Debt } from '@/src/types';
import { cashEffectOf } from '@/src/utils/analytics';
import { isSameDay } from '@/src/utils/date';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

type Direction = Debt['direction'];

/** Today keeps the current clock; a picked day lands at noon. */
function stampTime(day: Date): Date {
  const now = new Date();
  if (isSameDay(day, now)) return now;
  const date = new Date(day);
  date.setHours(12, 0, 0, 0);
  return date;
}

export default function EditDebtScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { state, updateDebt, totalBalance, debtsLoading } = useFinance();
  const { accounts, profile, debts } = state;
  const currency = profile.currency;

  const debt = debts.find((item) => item.id === params.id);

  const [direction, setDirection] = useState<Direction>(debt?.direction ?? 'borrowed');
  const [person, setPerson] = useState(debt?.person ?? '');
  const [amount, setAmount] = useState(debt ? String(debt.principal) : '');
  const [note, setNote] = useState(debt?.note ?? '');
  const [date, setDate] = useState(() => (debt ? new Date(debt.date) : new Date()));
  const [accountId, setAccountId] = useState(debt?.accountId ?? accounts[0]?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /**
   * Which record the form is currently showing. The debt list is read back from
   * the server, so a link opened at a cold start can land here before the
   * record it names has arrived — and the fields above were initialised from
   * nothing. This fills them in once it turns up, and then leaves them alone so
   * a later refresh cannot overwrite what is being typed.
   */
  const loadedId = useRef(debt?.id);

  useEffect(() => {
    if (!debt || loadedId.current === debt.id) return;
    loadedId.current = debt.id;
    setDirection(debt.direction);
    setPerson(debt.person);
    setAmount(String(debt.principal));
    setNote(debt.note ?? '');
    setDate(new Date(debt.date));
    setAccountId(debt.accountId);
  }, [debt]);

  // An account can be removed from the profile while this screen is open, and
  // the one this debt was filed against may already be gone.
  useEffect(() => {
    if (accounts.some((account) => account.id === accountId)) return;
    setAccountId(accounts[0]?.id ?? '');
  }, [accounts, accountId]);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/goals', params: { tab: 'debts' } });
  };

  if (!debt) {
    return (
      <ScreenBackground>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader title="Edit record" onBack={close} />
        </View>
        <View style={styles.content}>
          <Card>
            {/* Still on its way and genuinely gone look identical on screen,
                and telling someone their record does not exist when it is only
                a slow request is the worse of the two mistakes to make. */}
            {debtsLoading ? (
              <SkeletonRow lead={42} />
            ) : (
              <EmptyState
                icon="help-circle-outline"
                title="Record not found"
                body="This debt is no longer on your list. It may have been deleted from another device."
                actionLabel="Back to debts"
                onAction={close}
              />
            )}
          </Card>
        </View>
      </ScreenBackground>
    );
  }

  const borrowed = direction === 'borrowed';
  const parsed = Number(amount);
  const amountValid = Number.isFinite(parsed) && parsed > 0;

  /**
   * The amount cannot be dropped below what has already been settled. The
   * server would cap the repayment to fit instead, which quietly marks the
   * debt closed — so it is refused here where it can be explained.
   */
  const coversRepaid = parsed >= debt.repaid;

  /**
   * What the edit does to the cash on hand. Only the change matters: the debt
   * as it stands is already in the balance, so raising a loan by a hundred
   * needs a hundred available rather than the whole new figure.
   */
  const delta = amountValid
    ? cashEffectOf({ ...debt, direction, principal: parsed }) - cashEffectOf(debt)
    : 0;
  const withinBalance = totalBalance + delta >= 0;

  const valid =
    person.trim().length > 0 &&
    amountValid &&
    coversRepaid &&
    withinBalance &&
    accounts.length > 0;

  const save = async () => {
    if (!valid || saving) return;

    setSaving(true);
    setSaveError(null);

    const res = await updateDebt(debt.id, {
      person,
      direction,
      principal: parsed,
      date: stampTime(date).toISOString(),
      note,
      accountId,
    });

    setSaving(false);
    if (res.ok) return close();
    setSaveError(res.message);
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader
            title="Edit record"
            subtitle={borrowed ? 'Money a friend gave you' : 'Money you gave a friend'}
            onBack={close}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          <NoAccountsNotice
            title="Add an account first"
            body="A debt has to be filed against an account, and you do not have one."
          />

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
              />
            </View>
            <AppText variant="caption" color={colors.textMuted} center>
              {debt.repaid > 0
                ? `${formatCurrency(debt.repaid, currency)} already settled — repayments are kept as they are.`
                : 'Nothing settled on this record yet.'}
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
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              When
            </AppText>
            <DateField value={date} onChange={setDate} accessibilityLabel="Date the money moved" />
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
            label={saving ? 'Saving…' : 'Save changes'}
            icon="checkmark-circle"
            onPress={save}
            loading={saving}
            disabled={!valid || saving}
          />

          {amountValid && !coversRepaid ? (
            <AppText variant="caption" color={colors.expense} center>
              {formatCurrency(debt.repaid, currency)} has already been settled, so the amount cannot
              be lower than that.
            </AppText>
          ) : null}
          {amountValid && coversRepaid && !withinBalance ? (
            <AppText variant="caption" color={colors.expense} center>
              That change needs {formatCurrency(-delta, currency)} and you only have{' '}
              {formatCurrency(totalBalance, currency)} available.
            </AppText>
          ) : null}
          {saveError ? (
            <AppText variant="caption" color={colors.expense} center>
              {saveError}
            </AppText>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
