import type { DateKey } from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function dateKey(d: Date): DateKey {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayKey(): DateKey {
  return dateKey(new Date());
}

export function parseKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function addDaysKey(key: DateKey, n: number): DateKey {
  return dateKey(addDays(parseKey(key), n));
}

/** "Thursday, July 2" */
export function formatLong(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Jul 2" */
export function formatShort(key: DateKey): string {
  const d = parseKey(key);
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

/** "Thu" */
export function weekdayShort(key: DateKey): string {
  return WEEKDAYS[parseKey(key).getDay()].slice(0, 3);
}

export function greeting(name?: string): string {
  const h = new Date().getHours();
  const base = h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${base}, ${name}` : base;
}

export function isEvening(): boolean {
  return new Date().getHours() >= 20;
}

/** days from today to key: negative = past */
export function daysUntil(key: DateKey): number {
  const ms = parseKey(key).getTime() - parseKey(todayKey()).getTime();
  return Math.round(ms / 86400000);
}

/** "Today" / "Tomorrow" / "3d overdue" / "Jul 12" */
export function dueLabel(key: DateKey): string {
  const n = daysUntil(key);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 0) return `${-n}d overdue`;
  if (n < 7) return weekdayShort(key);
  return formatShort(key);
}

/** the 7 DateKeys of the week containing `key`, starting Monday */
export function weekOf(key: DateKey): DateKey[] {
  const d = parseKey(key);
  const monday = addDays(d, -((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => dateKey(addDays(monday, i)));
}

/** consecutive-day streak ending today (or yesterday, so a streak isn't dead before tonight) */
export function streak(log: Record<DateKey, true>, today: DateKey = todayKey()): number {
  let cursor = log[today] ? today : addDaysKey(today, -1);
  let count = 0;
  while (log[cursor]) {
    count += 1;
    cursor = addDaysKey(cursor, -1);
  }
  return count;
}

/** "HH:MM" -> "9:30 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${`${m}`.padStart(2, '0')} ${ampm}`;
}
