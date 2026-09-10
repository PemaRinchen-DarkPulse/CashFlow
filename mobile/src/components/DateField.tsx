import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/AppText';
import { colors, font, radius, shadow, spacing } from '@/src/theme';
import {
  addDays,
  daysInMonth,
  formatDayHeading,
  isSameDay,
  monthLabel,
  startOfDay,
  startOfMonth,
} from '@/src/utils/date';

export type DateFieldProps = {
  value: Date;
  onChange: (date: Date) => void;
  /** Latest date that can be picked. Defaults to today. */
  maximumDate?: Date;
  minimumDate?: Date;
  accessibilityLabel?: string;
};

/**
 * How far back the calendar will page. Long enough to backfill years of
 * history, short enough that the month arrows have an end.
 */
const EARLIEST = new Date(new Date().getFullYear() - 10, 0, 1);

/** Monday-based, matching `startOfWeek` and the weekly chart. */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Rows the grid always draws. Six is the most any month can occupy — a 31-day
 * month that opens on a Sunday — so reserving it means no month can need more.
 */
const WEEKS = 6;

/** The tappable circle for one day, and so the height of a grid row. */
const DAY_SIZE = 40;

/** Same month and year — the unit the grid pages by. */
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addCalendarMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/**
 * A date field that opens the app's own calendar in a bottom drawer.
 *
 * The OS pickers were the obvious way to do this and are deliberately not used:
 * Android's dialog and iOS's wheel each look like their platform rather than
 * like CashFlow, and they look nothing like each other. This follows
 * `ConfirmDialog`, which replaced `Alert.alert` for the same reason — the
 * calendar is built from the same tokens as every other surface, so one screen
 * does not suddenly hand the user a piece of the operating system.
 *
 * Any date in range is reachable by paging the month arrows, and the two dates
 * that are wanted most often have a chip so they stay a single tap away.
 */
export function DateField({
  value,
  onChange,
  maximumDate,
  minimumDate = EARLIEST,
  accessibilityLabel = 'Change date',
}: DateFieldProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  /** The month on screen, which moves independently of the chosen day. */
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value));

  const latest = useMemo(() => startOfDay(maximumDate ?? new Date()), [maximumDate]);
  const earliest = useMemo(() => startOfDay(minimumDate), [minimumDate]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const show = () => {
    // Always open on the month of the current value, however far the user
    // paged away the last time.
    setViewMonth(startOfMonth(value));
    setOpen(true);
  };

  const commit = (day: Date) => {
    Haptics.selectionAsync().catch(() => {});
    onChange(day);
    setOpen(false);
  };

  const inRange = (day: Date) => day >= earliest && day <= latest;

  /**
   * The cells of the month grid. Leading blanks pad the first row so the 1st
   * lands under its weekday; `null` marks those rather than a date so they
   * cannot be pressed.
   *
   * Always exactly six rows, trailing blanks included. A month needs four, five
   * or six depending on its length and which weekday it opens on, and letting
   * the grid size itself moved every row below it as the user paged — so the
   * day under a thumb about to tap was not the day that got tapped. The extra
   * blank row costs nothing and holds the whole sheet still.
   */
  const cells = useMemo(() => {
    const first = startOfMonth(viewMonth);
    // getDay() is Sunday-based; shift it so Monday starts the row.
    const lead = (first.getDay() + 6) % 7;
    const total = daysInMonth(viewMonth);
    const out: (Date | null)[] = Array.from({ length: lead }, () => null);
    for (let day = 1; day <= total; day += 1) {
      out.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }
    while (out.length < WEEKS * WEEKDAYS.length) out.push(null);
    return out;
  }, [viewMonth]);

  const canGoBack = startOfMonth(earliest) < startOfMonth(viewMonth);
  const canGoForward = startOfMonth(viewMonth) < startOfMonth(latest);

  const quickDates = [
    { label: 'Today', date: today },
    { label: 'Yesterday', date: addDays(today, -1) },
  ].filter((item) => inRange(item.date));

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: formatDayHeading(value.toISOString()) }}
        onPress={show}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}>
        <View style={styles.fieldIcon}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
        </View>
        <AppText style={styles.fieldText}>{formatDayHeading(value.toISOString())}</AppText>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityLabel="Dismiss"
          />

          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <MonthArrow
                icon="chevron-back"
                label="Previous month"
                disabled={!canGoBack}
                onPress={() => setViewMonth(addCalendarMonths(viewMonth, -1))}
              />
              <View style={styles.headerLabel}>
                <AppText variant="h3">{monthLabel(viewMonth)}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {viewMonth.getFullYear()}
                </AppText>
              </View>
              <MonthArrow
                icon="chevron-forward"
                label="Next month"
                disabled={!canGoForward}
                onPress={() => setViewMonth(addCalendarMonths(viewMonth, 1))}
              />
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day) => (
                <View key={day} style={styles.headCell}>
                  <AppText variant="caption" color={colors.textMuted} center>
                    {day}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (!day) return <View key={`pad-${index}`} style={styles.cell} />;

                const selected = isSameDay(day, value);
                const isToday = isSameDay(day, today);
                const disabled = !inRange(day);

                return (
                  <View key={day.toISOString()} style={styles.cell}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled }}
                      accessibilityLabel={formatDayHeading(day.toISOString())}
                      disabled={disabled}
                      onPress={() => commit(day)}
                      style={({ pressed }) => [
                        styles.day,
                        // Today is outlined rather than filled, so it still
                        // reads as "now" when another day is the selected one.
                        isToday && !selected && styles.dayToday,
                        selected && styles.daySelected,
                        pressed && !selected && styles.dayPressed,
                      ]}>
                      <AppText
                        style={[
                          styles.dayText,
                          isToday && !selected && { color: colors.primary },
                          selected && styles.dayTextSelected,
                          disabled && { color: colors.textMuted, opacity: 0.4 },
                        ]}>
                        {day.getDate()}
                      </AppText>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {quickDates.length ? (
              <View style={styles.quickRow}>
                {quickDates.map((item) => {
                  const selected = isSameDay(item.date, value);
                  return (
                    <Pressable
                      key={item.label}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => commit(item.date)}
                      style={[styles.quick, selected && styles.quickSelected]}>
                      <AppText
                        variant="label"
                        color={selected ? colors.primary : colors.textSecondary}>
                        {item.label}
                      </AppText>
                    </Pressable>
                  );
                })}
                {!isSameMonth(viewMonth, value) ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Back to the selected month"
                    onPress={() => setViewMonth(startOfMonth(value))}
                    style={styles.quick}>
                    <Ionicons name="return-down-back" size={14} color={colors.textSecondary} />
                    <AppText variant="label" color={colors.textSecondary}>
                      Selected
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

function MonthArrow({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: 'chevron-back' | 'chevron-forward';
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.arrow,
        pressed && { backgroundColor: colors.surfaceHigh },
        disabled && { opacity: 0.3 },
      ]}>
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  fieldPressed: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.surfaceHigh,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldText: {
    // Takes the slack so the chevron is pinned to the trailing edge.
    flex: 1,
    fontFamily: font.medium,
    fontSize: 15,
    color: colors.text,
  },
  backdrop: {
    flex: 1,
    // Deliberately unpainted. The dimming scrim the app's centred dialogs use
    // is not applied here: the drawer covers the bottom of the screen and the
    // form stays visible above it, so darkening the page only makes the fields
    // the date belongs to harder to read. The layer is still here, and still
    // transparent to the eye but not to touch, so tapping away closes the sheet.
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    ...shadow.card,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLabel: {
    alignItems: 'center',
    gap: 1,
  },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.xs,
  },
  /** The weekday labels, which size to their own text rather than to a day. */
  headCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    // Seven to a row, so the grid divides the sheet exactly.
    width: `${100 / 7}%`,
    // Stated rather than taken from the day inside it. A blank cell has no
    // child to give it height, so without this the reserved sixth row would
    // collapse to nothing and the grid would go back to changing size.
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayToday: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.primarySoft,
  },
  daySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayPressed: {
    backgroundColor: colors.surfaceHigh,
  },
  dayText: {
    fontFamily: font.medium,
    fontSize: 14.5,
    color: colors.text,
  },
  dayTextSelected: {
    fontFamily: font.bold,
    // The dark ink the app uses on every primary-filled surface.
    color: '#04140A',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickSelected: {
    borderColor: colors.primaryEdge,
    backgroundColor: colors.primarySoft,
  },
});
