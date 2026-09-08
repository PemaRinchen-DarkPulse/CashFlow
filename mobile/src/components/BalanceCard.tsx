import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { colors, font, radius, shadow, spacing } from '@/src/theme';
import { formatCurrency, maskAmount } from '@/src/utils/format';

export type BalanceCardProps = {
  balance: number;
  currency: string;
  hidden: boolean;
  onToggleHidden: () => void;
  /** Quick action row, rendered inside the card. */
  children?: ReactNode;
};

export function BalanceCard({
  balance,
  currency,
  hidden,
  onToggleHidden,
  children,
}: BalanceCardProps) {
  const amount = formatCurrency(balance, currency);

  return (
    <View style={[styles.wrapper, shadow.card]}>
      <LinearGradient
        colors={['#15272F', '#0E1B21', '#0B1418'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.edge} pointerEvents="none" />

      <View style={styles.header}>
        <AppText variant="label" color={colors.textSecondary}>
          Total Balance
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
          hitSlop={12}
          onPress={onToggleHidden}
          style={({ pressed }) => pressed && { opacity: 0.6 }}>
          <Ionicons
            name={hidden ? 'eye-off-outline' : 'eye-outline'}
            size={19}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      <AppText tabular style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
        {hidden ? maskAmount(amount) : amount}
      </AppText>

      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  edge: {
    position: 'absolute',
    right: 0,
    top: '22%',
    height: '46%',
    width: 3,
    borderTopLeftRadius: radius.pill,
    borderBottomLeftRadius: radius.pill,
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    fontFamily: font.extrabold,
    fontSize: 36,
    letterSpacing: -1.4,
    color: colors.text,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Was measured from the old change row; keeps the card's proportions now
    // that the figure sits directly above the actions.
    marginTop: spacing.xxl,
  },
});
