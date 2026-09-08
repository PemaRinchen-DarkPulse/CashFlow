import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { chartPalette, colors, font, radius, spacing } from '@/src/theme';
import type { IconName } from '@/src/types';
import { addMonths, formatDate } from '@/src/utils/date';
import { formatCurrency, sanitizeAmountInput } from '@/src/utils/format';

const ICONS: IconName[] = [
  'shield-checkmark',
  'airplane',
  'laptop',
  'home',
  'car-sport',
  'school',
  'gift',
  'heart',
  'rocket',
  'camera',
];

/** How far out the target date sits, in months. */
const HORIZONS = [3, 6, 12, 24];

export default function AddGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, addGoal } = useFinance();

  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [initial, setInitial] = useState('');
  const [icon, setIcon] = useState<IconName>('shield-checkmark');
  const [color, setColor] = useState<string>(chartPalette[0]);
  const [months, setMonths] = useState(6);

  const parsedTarget = Number(target);
  const parsedInitial = initial ? Number(initial) : 0;
  const valid =
    name.trim().length > 0 &&
    Number.isFinite(parsedTarget) &&
    parsedTarget > 0 &&
    Number.isFinite(parsedInitial) &&
    parsedInitial >= 0 &&
    parsedInitial <= parsedTarget;

  const deadline = addMonths(new Date(), months);
  const monthlyNeeded = valid ? (parsedTarget - parsedInitial) / months : 0;

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/goals', params: { tab: 'goals' } });
  };

  const save = () => {
    if (!valid) return;
    addGoal({
      name: name.trim(),
      target: parsedTarget,
      saved: parsedInitial,
      deadline: deadline.toISOString(),
      icon,
      color,
    });
    close();
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <View style={{ paddingTop: insets.top + spacing.md }}>
          <ScreenHeader title="New goal" subtitle="Give your saving a purpose" onBack={close} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
          <Card style={styles.preview}>
            <CategoryIcon icon={icon} color={color} size={56} />
            <View style={styles.previewText}>
              <AppText variant="h2" numberOfLines={1}>
                {name.trim() || 'Your goal'}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>
                {valid
                  ? `${formatCurrency(monthlyNeeded, state.profile.currency, 0)} a month to hit ${formatCurrency(parsedTarget, state.profile.currency, 0)} by ${formatDate(deadline)}`
                  : `Target date ${formatDate(deadline)}`}
              </AppText>
            </View>
          </Card>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              What are you saving for?
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Emergency fund, new bike, …"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountField}>
              <AppText variant="label" color={colors.textMuted} style={styles.label}>
                Target amount
              </AppText>
              <TextInput
                value={target}
                onChangeText={(text) => setTarget(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.amountField}>
              <AppText variant="label" color={colors.textMuted} style={styles.label}>
                Already saved
              </AppText>
              <TextInput
                value={initial}
                onChangeText={(text) => setInitial(sanitizeAmountInput(text))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              Target date
            </AppText>
            <View style={styles.row}>
              {HORIZONS.map((value) => {
                const selected = value === months;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setMonths(value)}
                    style={[styles.pill, selected && styles.pillSelected]}>
                    <AppText variant="label" color={selected ? '#04140A' : colors.textSecondary}>
                      {value} mo
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              Icon
            </AppText>
            <View style={styles.iconGrid}>
              {ICONS.map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: value === icon }}
                  onPress={() => setIcon(value)}
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                  <CategoryIcon icon={value} color={color} size={44} solid={value === icon} />
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <AppText variant="label" color={colors.textMuted} style={styles.label}>
              Colour
            </AppText>
            <View style={styles.row}>
              {chartPalette.map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`Colour ${value}`}
                  accessibilityState={{ selected: value === color }}
                  onPress={() => setColor(value)}
                  style={[
                    styles.swatch,
                    { backgroundColor: value },
                    value === color && styles.swatchSelected,
                  ]}
                />
              ))}
            </View>
          </View>

          <Button label="Create goal" icon="flag" onPress={save} disabled={!valid} />
          {initial && parsedInitial > parsedTarget ? (
            <AppText variant="caption" color={colors.expense} center>
              The amount already saved cannot exceed the target.
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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  previewText: {
    flex: 1,
    gap: 3,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 15,
  },
  amountRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  amountField: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pill: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.text,
  },
});
