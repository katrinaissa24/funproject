import type { FocusItem, Goal, Habit, InboxItem, Task } from '@/types';
import { daysUntil, formatShort, streak, todayKey } from './dates';

/**
 * The manager's brain: pick the 1–3 things that matter most today.
 * Priority: overdue tasks > due-today tasks > nearest goal milestone >
 * habit streaks at risk > an overflowing inbox.
 */
export function computeFocus(input: {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  inbox: InboxItem[];
}): FocusItem[] {
  const today = todayKey();
  const items: FocusItem[] = [];

  const open = input.tasks.filter((t) => !t.done);

  const overdue = open
    .filter((t) => t.due && t.due < today)
    .sort((a, b) => (a.due! < b.due! ? -1 : 1));
  for (const t of overdue.slice(0, 2)) {
    items.push({
      key: `task-${t.id}`,
      kind: 'overdue',
      title: t.title,
      detail: `Slipped past ${formatShort(t.due!)} — let's close it out.`,
    });
  }

  const dueToday = open
    .filter((t) => t.due === today)
    .sort((a, b) => Number(b.priority ?? false) - Number(a.priority ?? false));
  for (const t of dueToday.slice(0, 2)) {
    items.push({
      key: `task-${t.id}`,
      kind: 'due',
      title: t.title,
      detail: 'Due today.',
    });
  }

  const activeGoals = input.goals
    .filter((g) => g.milestones.some((m) => !m.done))
    .sort((a, b) => {
      const da = a.targetDate ? daysUntil(a.targetDate) : 9999;
      const db = b.targetDate ? daysUntil(b.targetDate) : 9999;
      return da - db;
    });
  const g = activeGoals[0];
  if (g) {
    const next = g.milestones.find((m) => !m.done)!;
    const when = g.targetDate ? ` ${Math.max(daysUntil(g.targetDate), 0)} days left.` : '';
    items.push({
      key: `goal-${g.id}`,
      kind: 'goal',
      title: `Move “${g.title}” forward`,
      detail: `Next step: ${next.title}.${when}`,
    });
  }

  const habitsAtRisk = input.habits
    .filter((h) => !h.log[today])
    .sort((a, b) => streak(b.log) - streak(a.log));
  const h = habitsAtRisk[0];
  if (h) {
    const s = streak(h.log);
    items.push({
      key: `habit-${h.id}`,
      kind: 'habit',
      title: `${h.emoji} ${h.name}`,
      detail: s > 1 ? `A ${s}-day streak is on the line.` : 'Small, today, done.',
    });
  }

  const unsorted = input.inbox.filter((i) => i.kind === 'unsorted').length;
  if (unsorted >= 8) {
    items.push({
      key: 'inbox',
      kind: 'inbox',
      title: 'Clear your head',
      detail: `${unsorted} thoughts are waiting in the inbox. A 2-minute triage will do it.`,
    });
  }

  return items.slice(0, 3);
}
