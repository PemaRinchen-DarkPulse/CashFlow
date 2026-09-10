import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { CategoryIcon, withAlpha } from '@/src/components/CategoryIcon';
import { ProgressBar } from '@/src/components/ProgressBar';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Goal } from '@/src/types';
import { daysUntil, formatDate } from '@/src/utils/date';
import { formatCurrency } from '@/src/utils/format';
import { goalProgress } from '@/src/utils/analytics';

export type GoalCardProps = {
  goal: Goal;
  currency: string;
  onAddFunds?: () => void;
  onPress?: () => void;
};

export function GoalCard({ goal, currency, onAddFunds, onPress }: GoalCardProps) {
  const progress = goalProgress(goal);
  const remaining = Math.max(goal.target - goal.saved, 0);
  const days = daysUntil(goal.deadline);
  const complete = progress >= 100;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.header}>
          {/*
            Same 42pt tile either way, so a goal with a picture and one without
            sit at identical heights in the list and the layout is unchanged.
          */}
          {goal.image ? (
            <Image
              source={{ uri: goal.image }}
              style={[styles.image, { borderColor: withAlpha(goal.color, 0.35) }]}
              contentFit="cover"
              // The picture is decoration for a goal whose name is already read
              // out beside it, so it is not announced twice.
              accessibilityElementsHidden
              importantForAccessibility="no"
              transition={160}
            />
          ) : (
            <CategoryIcon icon={goal.icon} color={goal.color} size={42} />
          )}
          <View style={styles.titles}>
            <AppText variant="h3" numberOfLines={1}>
              {goal.name}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {complete
                ? 'Goal reached 🎉'
                : days >= 0
                  ? `${formatDate(goal.deadline)} · ${days} days left`
                  : `Target date passed · ${formatDate(goal.deadline)}`}
            </AppText>
          </View>
          <AppText tabular style={[styles.percent, complete && { color: colors.primary }]}>
            {progress.toFixed(0)}%
          </AppText>
        </View>

        <ProgressBar value={progress} color={goal.color} height={9} />

        <View style={styles.footer}>
          <View>
            <AppText tabular style={styles.saved}>
              {formatCurrency(goal.saved, currency, 0)}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} tabular>
              of {formatCurrency(goal.target, currency, 0)} · {formatCurrency(remaining, currency, 0)} to go
            </AppText>
          </View>

          {onAddFunds && !complete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add funds to ${goal.name}`}
              onPress={onAddFunds}
              style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.7 }]}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <AppText variant="label" color={colors.primary}>
                Add
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </Card>
    </Pressable>
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
  image: {
    // Matches CategoryIcon at size 42 exactly, radius included, so swapping one
    // for the other moves nothing.
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  titles: {
    flex: 1,
    gap: 2,
  },
  percent: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  saved: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.text,
    letterSpacing: -0.4,
  },
  addButton: {
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
