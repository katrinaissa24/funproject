import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Body, Caption, Heading, Micro } from '@/components/typography';
import { formatLong, formatTime, greeting, isEvening, streak, todayKey } from '@/lib/dates';
import { computeFocus } from '@/lib/focus';
import { useEvents } from '@/stores/events';
import { useGoals } from '@/stores/goals';
import { useHabits } from '@/stores/habits';
import { useInbox } from '@/stores/inbox';
import { useNutrition } from '@/stores/nutrition';
import { useSettings } from '@/stores/settings';
import { useTasks } from '@/stores/tasks';
import { useWorkouts } from '@/stores/workouts';
import { colors, font, space, tints } from '@/theme';

const FOCUS_ICONS = {
  overdue: 'alert-circle',
  due: 'flag',
  goal: 'target',
  habit: 'repeat',
  inbox: 'inbox',
} as const;

export default function TodayScreen() {
  const today = todayKey();
  const name = useSettings((s) => s.name);
  const kcalTarget = useSettings((s) => s.kcalTarget);
  const proteinTarget = useSettings((s) => s.proteinTarget);

  const tasks = useTasks((s) => s.tasks);
  const toggleTask = useTasks((s) => s.toggle);
  const goals = useGoals((s) => s.goals);
  const habits = useHabits((s) => s.habits);
  const toggleHabit = useHabits((s) => s.toggle);
  const inboxItems = useInbox((s) => s.items);
  const events = useEvents((s) => s.events);
  const meals = useNutrition((s) => s.meals);
  const workouts = useWorkouts((s) => s.workouts);

  const focus = computeFocus({ tasks, goals, habits, inbox: inboxItems });
  const dueToday = tasks.filter((t) => !t.done && t.due && t.due <= today);
  const todayEvents = events
    .filter((e) => e.date === today)
    .sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99'));
  const todayMeals = meals.filter((m) => m.date === today);
  const kcal = todayMeals.reduce((sum, m) => sum + m.kcal, 0);
  const protein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const workedOut = workouts.some((w) => w.date === today);
  const unsorted = inboxItems.filter((i) => i.kind === 'unsorted').length;

  return (
    <Screen
      title={formatLong(new Date())}
      subtitle={`${greeting(name || undefined)}. Here’s the shape of your day.`}
      headerRight={
        <Pressable onPress={() => router.push('/settings')} hitSlop={10} style={{ paddingTop: 6 }}>
          <Feather name="settings" size={20} color={colors.inkFaint} />
        </Pressable>
      }
    >
      {/* Today's focus — the manager's ask */}
      <Card style={styles.focusCard}>
        <Micro style={{ color: colors.accent }}>Today’s focus</Micro>
        {focus.length === 0 ? (
          <Body style={{ marginTop: space.sm, fontFamily: font.serifItalic, fontSize: 17 }}>
            Nothing is on fire. Rest, or go move a goal forward.
          </Body>
        ) : (
          focus.map((item, i) => (
            <View key={item.key} style={[styles.focusItem, i > 0 && styles.focusDivider]}>
              <Feather
                name={FOCUS_ICONS[item.kind]}
                size={16}
                color={colors.accent}
                style={{ marginTop: 3 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.focusTitle}>{item.title}</Text>
                <Caption>{item.detail}</Caption>
              </View>
            </View>
          ))
        )}
        {focus.length > 0 ? (
          <Caption style={{ marginTop: space.md, fontFamily: font.serifItalic, color: colors.inkFaint }}>
            {focus.length === 1 ? 'One thing today. That’s all.' : `${focus.length === 2 ? 'Two' : 'Three'} things today. That’s all.`}
          </Caption>
        ) : null}
      </Card>

      {/* Agenda */}
      {(todayEvents.length > 0 || dueToday.length > 0) && (
        <>
          <SectionHeader label="On your plate" action="Plan" onAction={() => router.push('/plan')} />
          <Card>
            {todayEvents.map((e) => (
              <View key={e.id} style={styles.row}>
                <Text style={styles.time}>{e.start ? formatTime(e.start) : 'All day'}</Text>
                <Body style={{ flex: 1 }}>{e.title}</Body>
              </View>
            ))}
            {dueToday.map((t) => (
              <View key={t.id} style={styles.row}>
                <Checkbox checked={t.done} onToggle={() => toggleTask(t.id)} size={22} />
                <Body style={{ flex: 1 }}>{t.title}</Body>
                {t.due && t.due < today ? (
                  <Caption style={{ color: colors.danger }}>overdue</Caption>
                ) : null}
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Habits */}
      {habits.length > 0 && (
        <>
          <SectionHeader label="Daily habits" action="Goals" onAction={() => router.push('/goals')} />
          <Card>
            {habits.map((h) => {
              const s = streak(h.log);
              return (
                <View key={h.id} style={styles.row}>
                  <Checkbox
                    checked={!!h.log[today]}
                    onToggle={() => toggleHabit(h.id, today)}
                    color={tints.goals.color}
                    size={22}
                  />
                  <Body style={{ flex: 1 }}>
                    {h.emoji} {h.name}
                  </Body>
                  {s > 0 ? <Caption>🔥 {s}</Caption> : null}
                </View>
              );
            })}
          </Card>
        </>
      )}

      {/* Body */}
      <SectionHeader label="Body" action="Log" onAction={() => router.push('/body')} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <ProgressRing progress={kcal / kcalTarget} size={72} color={tints.body.color}>
          <Caption style={{ fontFamily: font.semibold, color: colors.ink }}>{kcal}</Caption>
          <Caption style={{ fontSize: 10 }}>kcal</Caption>
        </ProgressRing>
        <ProgressRing progress={protein / proteinTarget} size={72} color={tints.body.color}>
          <Caption style={{ fontFamily: font.semibold, color: colors.ink }}>{protein}g</Caption>
          <Caption style={{ fontSize: 10 }}>protein</Caption>
        </ProgressRing>
        <View style={{ flex: 1 }}>
          <Heading style={{ fontSize: 15 }}>{workedOut ? 'Workout logged ✓' : 'No workout yet'}</Heading>
          <Caption style={{ marginTop: 2 }}>
            {kcal === 0 && !workedOut
              ? 'The day is young.'
              : `${Math.max(kcalTarget - kcal, 0)} kcal and ${Math.max(proteinTarget - protein, 0)}g protein to go.`}
          </Caption>
        </View>
      </Card>

      {/* Inbox nudge */}
      {unsorted > 0 && (
        <Pressable onPress={() => router.push('/inbox')}>
          <Card style={[styles.inboxNudge]}>
            <Feather name="inbox" size={18} color={tints.inbox.color} />
            <Body style={{ flex: 1 }}>
              {unsorted} {unsorted === 1 ? 'thought is' : 'thoughts are'} waiting to be sorted.
            </Body>
            <Feather name="chevron-right" size={18} color={colors.inkFaint} />
          </Card>
        </Pressable>
      )}

      {/* Evening review */}
      {isEvening() && (
        <Pressable onPress={() => router.push('/review')}>
          <Card style={styles.reviewCard}>
            <Micro style={{ color: colors.card, opacity: 0.7 }}>Evening</Micro>
            <Text style={styles.reviewTitle}>Close the day</Text>
            <Caption style={{ color: colors.card, opacity: 0.8 }}>
              A two-minute review, and tomorrow is already lighter.
            </Caption>
          </Card>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  focusCard: {
    backgroundColor: colors.accentFaint,
    borderColor: colors.accentSoft,
  },
  focusItem: {
    flexDirection: 'row',
    gap: space.md,
    paddingTop: space.md,
  },
  focusDivider: {
    marginTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.accentSoft,
  },
  focusTitle: {
    fontFamily: font.display,
    fontSize: 17,
    lineHeight: 23,
    color: colors.ink,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 9,
  },
  time: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate,
    width: 64,
  },
  inboxNudge: {
    marginTop: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.ochreSoft,
    borderColor: colors.ochreSoft,
  },
  reviewCard: {
    marginTop: space.xl,
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  reviewTitle: {
    fontFamily: font.display,
    fontSize: 20,
    color: colors.card,
    marginTop: 6,
    marginBottom: 2,
  },
});
