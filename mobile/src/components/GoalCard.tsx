import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { CategoryIcon, withAlpha } from '@/src/components/CategoryIcon';
import { ProgressBar } from '@/src/components/ProgressBar';
import { Skeleton } from '@/src/components/Skeleton';
import { colors, font, radius, spacing } from '@/src/theme';
import type { Goal } from '@/src/types';
import { daysUntil, formatDate } from '@/src/utils/date';
import { formatCurrency } from '@/src/utils/format';
import { goalProgress } from '@/src/utils/analytics';

/**
 * The tile a card leads with. One size for the picture, the placeholder and the
 * icon alike, so a goal with a photo and one without sit at identical heights
 * in the list and nothing moves as the photos arrive.
 */
const TILE = 42;

export type GoalCardProps = {
  goal: Goal;
  currency: string;
  onAddFunds?: () => void;
  onPress?: () => void;
};

/**
 * The picture a goal leads with, or its icon when there is none.
 *
 * By the time a card is drawn the photo is normally already in the image cache:
 * `FinanceContext` prefetches every picture before it hands the goals to the
 * reducer, precisely so that no card is ever shown with a hole in it. The
 * placeholder below is therefore the exception and not the rule — it covers a
 * prefetch that timed out or a cache the system has since reclaimed, where the
 * choice is a shimmer or an empty square.
 *
 * A picture that fails outright falls back to the goal's icon. A shimmer that
 * never resolves would be the same broken feeling arriving one step later, and
 * the icon is what a goal with no photo shows anyway.
 */
function GoalThumbnail({ goal }: { goal: Goal }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!goal.image || failed) {
    return <CategoryIcon icon={goal.icon} color={goal.color} size={TILE} />;
  }

  return (
    <View style={styles.thumbnail}>
      {/*
        Behind the picture rather than over it: the image fades in on top of the
        shimmer, instead of the shimmer being cut away in a single frame to
        reveal a photo that was already there.
      */}
      {loaded ? null : (
        <Skeleton
          width={TILE}
          height={TILE}
          radius={radius.sm}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Image
        source={{ uri: goal.image }}
        style={[styles.image, { borderColor: withAlpha(goal.color, 0.35) }]}
        contentFit="cover"
        // The picture is decoration for a goal whose name is already read out
        // beside it, so it is not announced twice.
        accessibilityElementsHidden
        importantForAccessibility="no"
        transition={160}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

export function GoalCard({ goal, currency, onAddFunds, onPress }: GoalCardProps) {
  const progress = goalProgress(goal);
  const remaining = Math.max(goal.target - goal.saved, 0);
  const days = daysUntil(goal.deadline);
  const complete = progress >= 100;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      <Card style={styles.card}>
        <View style={styles.header}>
          <GoalThumbnail goal={goal} />
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
  thumbnail: {
    width: TILE,
    height: TILE,
  },
  image: {
    // Matches CategoryIcon at the same size exactly, radius included, so
    // swapping one for the other moves nothing.
    width: TILE,
    height: TILE,
    borderRadius: radius.sm,
    borderWidth: 1,
    // No background: the placeholder sits behind this while the photo loads,
    // and an opaque fill here would hide it.
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
