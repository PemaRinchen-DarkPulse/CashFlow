import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { CategoryIcon } from '@/src/components/CategoryIcon';
import { ProgressBar } from '@/src/components/ProgressBar';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SectionHeader } from '@/src/components/SectionHeader';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, shadow, spacing } from '@/src/theme';
import { budgetStatuses, monthTransactions, totalsOf } from '@/src/utils/analytics';

/** Half the space between badge cards; applied as padding on each cell. */
const GUTTER = 6;

/** Points thresholds for each tier. */
const TIERS = [
  { name: 'Starter', at: 0 },
  { name: 'Saver', at: 500 },
  { name: 'Planner', at: 1500 },
  { name: 'Strategist', at: 3000 },
];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { state, streak } = useFinance();
  const { rewards, transactions, budgets, categories } = state;

  const tier = useMemo(() => {
    const index = Math.max(
      TIERS.findIndex((item, i) => rewards.points >= item.at && (!TIERS[i + 1] || rewards.points < TIERS[i + 1].at)),
      0
    );
    const next = TIERS[index + 1];
    const floor = TIERS[index].at;
    return {
      current: TIERS[index],
      next,
      progress: next ? ((rewards.points - floor) / (next.at - floor)) * 100 : 100,
      toNext: next ? next.at - rewards.points : 0,
    };
  }, [rewards.points]);

  const challenges = useMemo(() => {
    const now = new Date();
    const month = monthTransactions(transactions, now);
    const totals = totalsOf(month);
    const statuses = budgetStatuses(budgets, transactions, categories, now);
    const withinBudget = statuses.filter((item) => item.state === 'safe').length;
    const savingsRate = totals.income === 0 ? 0 : (totals.net / totals.income) * 100;

    return [
      {
        id: 'streak',
        title: 'Track 7 days in a row',
        detail: `${Math.min(streak, 7)}/7 days`,
        progress: Math.min((streak / 7) * 100, 100),
        icon: 'flame' as const,
        color: colors.warning,
      },
      {
        id: 'budgets',
        title: 'Keep every budget in the green',
        detail: `${withinBudget}/${statuses.length || 0} categories on track`,
        progress: statuses.length === 0 ? 0 : (withinBudget / statuses.length) * 100,
        icon: 'shield-checkmark' as const,
        color: colors.primary,
      },
      {
        id: 'save',
        title: 'Save 20% of income this month',
        detail: `${Math.max(savingsRate, 0).toFixed(0)}% saved`,
        progress: Math.min(Math.max(savingsRate, 0) / 20 * 100, 100),
        icon: 'trending-up' as const,
        color: colors.info,
      },
    ];
  }, [transactions, budgets, categories, streak]);

  return (
    <ScreenBackground>
      <View style={{ paddingTop: insets.top + spacing.md }}>
        <ScreenHeader title="Rewards" subtitle="Good habits, tracked" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.hero, shadow.card]}>
            <LinearGradient
              colors={['#15272F', '#0D1A20'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.trophy}>
              <Ionicons name="trophy" size={26} color={colors.primary} />
            </View>
            <AppText tabular style={styles.points}>
              {rewards.points.toLocaleString()}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              points · {tier.current.name} tier
            </AppText>

            <View style={styles.tierBar}>
              <ProgressBar value={tier.progress} height={9} />
              <AppText variant="caption" color={colors.textMuted}>
                {tier.next
                  ? `${tier.toNext} points to ${tier.next.name}`
                  : 'Top tier reached — nicely done.'}
              </AppText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(60)} style={styles.streakRow}>
          <Card style={styles.streakCard}>
            <Ionicons name="flame" size={20} color={colors.warning} />
            <AppText tabular style={styles.streakValue}>
              {streak}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              day streak
            </AppText>
          </Card>
          <Card style={styles.streakCard}>
            <Ionicons name="ribbon" size={20} color={colors.primary} />
            <AppText tabular style={styles.streakValue}>
              {rewards.badges.filter((badge) => badge.earned).length}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              badges earned
            </AppText>
          </Card>
          <Card style={styles.streakCard}>
            <Ionicons name="receipt" size={20} color={colors.info} />
            <AppText tabular style={styles.streakValue}>
              {transactions.length}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              logged
            </AppText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(120)}>
          <SectionHeader title="Active challenges" subtitle="Earn points by finishing these" />
          <Card style={styles.challengeCard}>
            {challenges.map((challenge, index) => (
              <View key={challenge.id} style={styles.challenge}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.challengeHeader}>
                  <CategoryIcon icon={challenge.icon} color={challenge.color} size={36} />
                  <View style={styles.challengeText}>
                    <AppText variant="bodyMedium">{challenge.title}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {challenge.detail}
                    </AppText>
                  </View>
                  <AppText tabular variant="label" color={colors.textSecondary}>
                    {challenge.progress.toFixed(0)}%
                  </AppText>
                </View>
                <ProgressBar
                  value={challenge.progress}
                  color={challenge.color}
                  delay={index * 90}
                  height={6}
                />
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(420).delay(180)}>
          <SectionHeader title="Badges" subtitle="Milestones along the way" />
          <View style={styles.badgeGrid}>
            {rewards.badges.map((badge) => (
              <View key={badge.id} style={styles.badgeCell}>
                <Card style={[styles.badge, !badge.earned && styles.badgeLocked]}>
                  <CategoryIcon
                    icon={badge.earned ? badge.icon : 'lock-closed'}
                    color={badge.earned ? colors.primary : colors.textMuted}
                    size={42}
                    solid={badge.earned}
                  />
                  <AppText variant="label" center numberOfLines={1}>
                    {badge.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textMuted} center numberOfLines={2}>
                    {badge.hint}
                  </AppText>
                </Card>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  trophy: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryEdge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  points: {
    fontFamily: font.extrabold,
    fontSize: 40,
    letterSpacing: -1.5,
    color: colors.text,
  },
  tierBar: {
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  streakCard: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    padding: spacing.lg,
  },
  streakValue: {
    fontFamily: font.bold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: colors.text,
    marginTop: 2,
  },
  challengeCard: {
    gap: spacing.lg,
  },
  challenge: {
    gap: spacing.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  challengeText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  /**
   * Three exact thirds. A percentage width plus a pixel `gap` cannot be made to
   * fit — 3 × 31% + 24px overflows the row and drops a badge onto the next
   * line — so the gutter comes from cell padding instead, cancelled at the
   * edges by the negative margin.
   */
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GUTTER,
  },
  badgeCell: {
    width: '33.333%',
    padding: GUTTER,
  },
  badge: {
    // Fills the cell so every card in a row shares the tallest one's height.
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  badgeLocked: {
    opacity: 0.55,
  },
});
