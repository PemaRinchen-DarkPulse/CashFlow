import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { Button } from '@/src/components/Button';
import { Chip } from '@/src/components/Chip';
import { DateField } from '@/src/components/DateField';
import { colors, radius, spacing } from '@/src/theme';
import type { Category } from '@/src/types';
import { startOfDay } from '@/src/utils/date';

export type DateCategoryFilterProps = {
  visible: boolean;
  onClose: () => void;
  date: Date | null;
  onDateChange: (date: Date) => void;
  onDateClear: () => void;
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  categories: Category[];
  onReset: () => void;
};

/**
 * Filter drawer for Activity and Analytics: a date (the same field as adding
 * income) and a category. Both apply together.
 */
export function DateCategoryFilter({
  visible,
  onClose,
  date,
  onDateChange,
  onDateClear,
  categoryId,
  onCategoryChange,
  categories,
  onReset,
}: DateCategoryFilterProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const active = date !== null || categoryId !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss filters"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <AppText variant="h2">Filter</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset filters"
              accessibilityState={{ disabled: !active }}
              disabled={!active}
              onPress={onReset}
              hitSlop={8}
              style={styles.reset}>
              <AppText variant="label" color={active ? colors.primary : colors.textMuted}>
                Reset
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: height * 0.58 }}
            contentContainerStyle={styles.body}>
            <View>
              <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
                Date
              </AppText>
              <DateField
                value={date}
                placeholder="Any time"
                onChange={(day) => onDateChange(startOfDay(day))}
                onClear={onDateClear}
                accessibilityLabel="Filter by date"
              />
            </View>

            <View>
              <AppText variant="label" color={colors.textMuted} style={styles.fieldLabel}>
                Category
              </AppText>
              <View style={styles.chips}>
                <Chip
                  label="All"
                  selected={categoryId === null}
                  onPress={() => onCategoryChange(null)}
                />
                {categories.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    icon={item.icon}
                    accent={item.color}
                    selected={categoryId === item.id}
                    onPress={() => onCategoryChange(categoryId === item.id ? null : item.id)}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <Button label="Done" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceHigh,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  reset: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  body: {
    gap: spacing.xl,
    paddingBottom: spacing.sm,
  },
  fieldLabel: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
