import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Card } from '@/src/components/Card';
import { Chip } from '@/src/components/Chip';
import { DateCategoryFilter } from '@/src/components/DateCategoryFilter';
import { EmptyState } from '@/src/components/EmptyState';
import { FilterButton } from '@/src/components/FilterButton';
import { ScreenBackground } from '@/src/components/ScreenBackground';
import { Skeleton, SkeletonRow } from '@/src/components/Skeleton';
import { TransactionRow } from '@/src/components/TransactionRow';
import { useFinance } from '@/src/store/FinanceContext';
import { colors, font, radius, shadow, spacing } from '@/src/theme';
import type { Transaction } from '@/src/types';
import { categoryOf, inRange, totalsOf } from '@/src/utils/analytics';
import { endOfDay, formatDayHeading, startOfDay } from '@/src/utils/date';
import { formatCurrency } from '@/src/utils/format';

type Filter = 'all' | 'income' | 'expense';

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, transactionsLoading, transactionsError, refreshTransactions } = useFinance();
  const { transactions, categories, profile, settings } = state;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filtersActive = filterDate !== null || categoryId !== null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const dayStart = filterDate ? startOfDay(filterDate) : null;
    const dayEnd = filterDate ? endOfDay(filterDate) : null;
    return transactions.filter((item) => {
      if (filter !== 'all' && item.kind !== filter) return false;
      if (categoryId && item.categoryId !== categoryId) return false;
      if (dayStart && dayEnd && !inRange(item, dayStart, dayEnd)) return false;
      if (!needle) return true;
      const category = categoryOf(categories, item.categoryId);
      return (
        item.title.toLowerCase().includes(needle) ||
        category.name.toLowerCase().includes(needle) ||
        (item.note?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [transactions, categories, filter, categoryId, filterDate, query]);

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

  const filterCaption = useMemo(() => {
    const parts: string[] = [];
    if (filterDate) parts.push(formatDayHeading(filterDate.toISOString()));
    if (filter === 'income') parts.push('Income');
    else if (filter === 'expense') parts.push('Expenses');
    if (categoryId) {
      const category = categories.find((item) => item.id === categoryId);
      if (category) parts.push(category.name);
    }
    const count = `${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`;
    return parts.length > 0 ? `${parts.join(' · ')} · ${count}` : count;
  }, [filterDate, filter, categoryId, categories, filtered.length]);

  const applyKind = (value: Filter) => {
    setFilter(value);
    if (categoryId) {
      const category = categories.find((item) => item.id === categoryId);
      if (category && value !== 'all' && category.kind !== value) setCategoryId(null);
    }
  };

  const resetFilters = () => {
    setFilterDate(null);
    setCategoryId(null);
  };

  const titleBlock = (
    <View style={styles.titleRow}>
      <View style={styles.titleText}>
        <AppText variant="h1">Activity</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {transactionsLoading ? 'Loading' : transactionsError ? 'Unavailable' : filterCaption}
        </AppText>
      </View>
      <FilterButton
        accessibilityLabel="Filter activity"
        active={filtersActive}
        onPress={() => setFilterOpen(true)}
      />
    </View>
  );

  const header = (
    <View style={styles.header}>
      {titleBlock}

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
            onPress={() => applyKind(value)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      {transactionsLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl * 2 },
          ]}>
          <View style={styles.header}>
            {titleBlock}
            <Card style={styles.summarySkeleton}>
              <Skeleton width="28%" height={12} />
              <Skeleton width="40%" height={18} />
            </Card>
            <Card>
              <SkeletonRow lead={42} />
              <SkeletonRow lead={42} />
              <SkeletonRow lead={42} />
            </Card>
          </View>
        </ScrollView>
      ) : transactionsError ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxxl * 2 },
          ]}>
          <View style={styles.header}>
            {titleBlock}
            <Card>
              <EmptyState
                icon="cloud-offline-outline"
                title="Can't load activity"
                body={`${transactionsError}. Your records are safe — this device just cannot reach them right now.`}
                actionLabel="Try again"
                onAction={refreshTransactions}
              />
            </Card>
          </View>
        </ScrollView>
      ) : (
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
          transactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No activity yet"
              body="Income and spending you log will show up here — only what is on your account, not sample data."
              actionLabel="Add a transaction"
              onAction={() =>
                router.push({ pathname: '/add-transaction', params: { kind: 'expense' } })
              }
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No matching transactions"
              body="Try a different search term, or clear the filters to see everything."
              actionLabel="Clear filters"
              onAction={() => {
                setQuery('');
                setFilter('all');
                setCategoryId(null);
                setFilterDate(null);
              }}
            />
          )
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
      )}

      <DateCategoryFilter
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        date={filterDate}
        onDateChange={setFilterDate}
        onDateClear={() => setFilterDate(null)}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        categories={categories}
        onReset={resetFilters}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        onPress={() => router.push({ pathname: '/add-transaction', params: { kind: 'expense' } })}
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
    gap: spacing.md,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
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
  summarySkeleton: {
    gap: spacing.sm,
    padding: spacing.lg,
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
