import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Chip } from '@/src/components/Chip';
import { EmptyState } from '@/src/components/EmptyState';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { TransactionRow } from '@/src/components/TransactionRow';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, shadow, spacing } from '@/src/theme';
import type { Transaction } from '@/src/types';
import { categoryOf, totalsOf } from '@/src/utils/analytics';
import { formatDayHeading, startOfDay } from '@/src/utils/date';
import { formatCurrency } from '@/src/utils/format';

type Filter = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useFinance();
  const { transactions, categories, profile, settings } = state;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false;
      if (categoryId && item.categoryId !== categoryId) return false;
      if (!needle) return true;
      const category = categoryOf(categories, item.categoryId);
      return (
        item.title.toLowerCase().includes(needle) ||
        category.name.toLowerCase().includes(needle) ||
        (item.note?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [transactions, categories, filter, categoryId, query]);

  const sections = useMemo(() => {
    const groups = new Map<number, Transaction[]>();
    for (const item of filtered) {
      const key = startOfDay(new Date(item.date)).getTime();
      const bucket = groups.get(key);
      if (bucket) bucket.push(item);
      else groups.set(key, [item]);
    }
    return [...groups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([key, data]) => ({
        key: String(key),
        title: formatDayHeading(new Date(key).toISOString()),
        data,
      }));
  }, [filtered]);

  const totals = useMemo(() => totalsOf(filtered), [filtered]);

  /** Categories that actually appear in the ledger, so the filter row stays useful. */
  const usedCategories = useMemo(() => {
    const ids = new Set(transactions.map((item) => item.categoryId));
    return categories.filter((category) => ids.has(category.id));
  }, [transactions, categories]);

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <AppText variant="h1">Activity</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {filtered.length} transaction{filtered.length === 1 ? '' : 's'}
          </AppText>
        </View>
      </View>

      <Card style={styles.summary} padded={false}>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textMuted}>
            Money in
          </AppText>
          <AppText tabular style={[styles.summaryValue, { color: colors.income }]}>
            {formatCurrency(totals.income, profile.currency, 0)}
          </AppText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textMuted}>
            Money out
          </AppText>
          <AppText tabular style={[styles.summaryValue, { color: colors.expense }]}>
            {formatCurrency(totals.expense, profile.currency, 0)}
          </AppText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <AppText variant="caption" color={colors.textMuted}>
            Net
          </AppText>
          <AppText tabular style={styles.summaryValue}>
            {formatCurrency(totals.net, profile.currency, 0)}
          </AppText>
        </View>
      </Card>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={17} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search transactions"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={17} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {(['all', 'expense', 'income'] as Filter[]).map((value) => (
          <Chip
            key={value}
            label={value === 'all' ? 'All' : value === 'income' ? 'Income' : 'Expenses'}
            selected={filter === value}
            onPress={() => setFilter(value)}
          />
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryStrip}
        contentContainerStyle={styles.categoryRow}>
        {usedCategories.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            icon={item.icon}
            accent={item.color}
            selected={categoryId === item.id}
            onPress={() => setCategoryId(categoryId === item.id ? null : item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScreenBackground>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl * 2 },
        ]}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No matching transactions"
            body="Try a different search term, or clear the filters to see everything."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setFilter('all');
              setCategoryId(null);
            }}
          />
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="label" color={colors.textMuted} style={styles.sectionHeading}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item, index, section }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;
          return (
            <View style={[styles.rowCard, first && styles.rowCardFirst, last && styles.rowCardLast]}>
              {!first ? <View style={styles.divider} /> : null}
              <TransactionRow
                transaction={item}
                category={categoryOf(categories, item.categoryId)}
                currency={profile.currency}
                hidden={settings.hideBalance}
                onPress={() =>
                  router.push({ pathname: '/transaction/[id]', params: { id: item.id } })
                }
              />
            </View>
          );
        }}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        onPress={() => router.push('/add-transaction')}
        style={({ pressed }) => [
          styles.fab,
          shadow.glow,
          { bottom: spacing.xl },
          pressed && { transform: [{ scale: 0.94 }] },
        ]}>
        <Ionicons name="add" size={26} color="#04140A" />
      </Pressable>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  summaryValue: {
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.3,
  },
  summaryDivider: {
    width: 1,
    height: 26,
    backgroundColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 14.5,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryStrip: {
    marginHorizontal: -spacing.xl,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  sectionHeading: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowCard: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  rowCardFirst: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
  },
  rowCardLast: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomWidth: 1,
    paddingBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 56,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
