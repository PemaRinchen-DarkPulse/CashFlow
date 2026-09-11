const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

/** Inclusive calendar days between two dates. Always at least 1. */
export function calendarDays(from: Date, to: Date): number {
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export type DatePreset = 'any' | 'today' | 'week' | 'month' | 'year' | 'custom';

export type DateWindow = { from: Date; to: Date };

/**
 * The inclusive window a date-filter preset covers. `any` means no bound, so
 * the caller should skip filtering rather than invent a range.
 */
export function windowForDatePreset(
  preset: DatePreset,
  customFrom: Date,
  customTo: Date,
  now = new Date()
): DateWindow | null {
  if (preset === 'any') return null;
  if (preset === 'today') return { from: startOfDay(now), to: endOfDay(now) };
  if (preset === 'week') return { from: startOfWeek(now), to: endOfDay(now) };
  if (preset === 'month') return { from: startOfMonth(now), to: endOfMonth(now) };
  if (preset === 'year') {
    return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
  }
  const from = startOfDay(customFrom);
  const to = endOfDay(customTo);
  return from <= to ? { from, to } : { from: to, to: from };
}

/**
 * The comparison window used by Analytics. Month is month-to-date against the
 * same point last month, not a full previous month. Custom is the same length
 * immediately before the chosen range.
 */
export function previousWindowForPreset(
  preset: DatePreset,
  current: DateWindow,
  now = new Date()
): DateWindow | null {
  if (preset === 'any') return null;
  if (preset === 'today') {
    const day = addDays(startOfDay(now), -1);
    return { from: day, to: endOfDay(day) };
  }
  if (preset === 'week') {
    return { from: addDays(current.from, -7), to: endOfDay(addDays(current.from, -1)) };
  }
  if (preset === 'month') {
    const last = addMonths(startOfMonth(now), -1);
    const day = Math.min(now.getDate(), daysInMonth(last));
    return {
      from: startOfMonth(last),
      to: new Date(last.getFullYear(), last.getMonth(), day, 23, 59, 59, 999),
    };
  }
  if (preset === 'year') {
    const year = now.getFullYear() - 1;
    return {
      from: new Date(year, 0, 1),
      to: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }
  const length = current.to.getTime() - current.from.getTime();
  const to = new Date(current.from.getTime() - 1);
  return { from: new Date(to.getTime() - length), to };
}

export function labelForDatePreset(
  preset: DatePreset,
  customFrom: Date,
  customTo: Date,
  now = new Date()
): string | null {
  if (preset === 'any') return null;
  if (preset === 'today') return 'Today';
  if (preset === 'week') return 'This week';
  if (preset === 'month') return `${monthLabel(now)} ${now.getFullYear()}`;
  if (preset === 'year') return String(now.getFullYear());
  return formatDateRange(customFrom, customTo);
}

/** `May 24, 2026` or `May 1, 2026 – May 24, 2026`. */
export function formatDateRange(from: Date, to: Date): string {
  if (isSameDay(from, to)) return formatDate(from);
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** Monday-based week start, matching the weekly chart. */
export function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = (next.getDay() + 6) % 7;
  return addDays(next, -day);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** `2026-09` — stable key for grouping by month. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(date: Date, short = false): string {
  return short ? MONTHS_SHORT[date.getMonth()] : MONTHS[date.getMonth()];
}

export function dayLabel(date: Date): string {
  return DAYS_SHORT[date.getDay()];
}

/** `May 24, 2026` */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** `10:45 AM` */
export function formatTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/** `Today, 10:45 AM` / `Yesterday, 6:02 PM` / `May 24, 2026` */
export function formatTransactionDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  if (isSameDay(date, now)) return `Today, ${formatTime(date)}`;
  if (isSameDay(date, addDays(now, -1))) return `Yesterday, ${formatTime(date)}`;
  return formatDate(date);
}

/** Section heading for grouped transaction lists. */
export function formatDayHeading(value: string): string {
  const date = new Date(value);
  const now = new Date();
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, addDays(now, -1))) return 'Yesterday';
  return formatDate(date);
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** Whole days from now until `iso`; negative when the date has passed. */
export function daysUntil(iso: string): number {
  const diff = startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime();
  return Math.round(diff / 86_400_000);
}
