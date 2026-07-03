import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Field } from '@/components/Field';
import { PillButton } from '@/components/PillButton';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Sheet } from '@/components/Sheet';
import { WeekDots } from '@/components/WeekDots';
import { Body, Caption, Micro } from '@/components/typography';
import { addDaysKey, daysUntil, streak, todayKey } from '@/lib/dates';
import { successHaptic } from '@/lib/haptics';
import { useGoals } from '@/stores/goals';
import { useHabits } from '@/stores/habits';
import { colors, font, space, tints } from '@/theme';

const EMOJIS = ['📖', '💪', '🧘', '✍️', '🌱', '💧', '🎯', '🧠'];
const HORIZONS = [
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: 'This year', days: null as number | null },
  { label: 'Open-ended', days: -1 },
];

export default function GoalsScreen() {
  const goals = useGoals((s) => s.goals);
  const addGoal = useGoals((s) => s.addGoal);
  const habits = useHabits((s) => s.habits);
  const addHabit = useHabits((s) => s.addHabit);
  const toggleHabit = useHabits((s) => s.toggle);

  const today = todayKey();

  const [goalSheet, setGoalSheet] = useState(false);
  const [gTitle, setGTitle] = useState('');
  const [gWhy, setGWhy] = useState('');
  const [gHorizon, setGHorizon] = useState(2);
  const [gMilestones, setGMilestones] = useState('');

  const [habitSheet, setHabitSheet] = useState(false);
  const [hName, setHName] = useState('');
  const [hEmoji, setHEmoji] = useState(EMOJIS[0]);

  const saveGoal = () => {
    if (!gTitle.trim()) return;
    const horizon = HORIZONS[gHorizon];
    let targetDate: string | undefined;
    if (horizon.days === null) {
      const now = new Date();
      targetDate = `${now.getFullYear()}-12-31`;
    } else if (horizon.days > 0) {
      targetDate = addDaysKey(today, horizon.days);
    }
    addGoal({
      title: gTitle,
      why: gWhy.trim() || 'Because future-you asked for it.',
      targetDate,
      milestones: gMilestones.split('\n'),
    });
    successHaptic();
    setGoalSheet(false);
    setGTitle('');
    setGWhy('');
    setGMilestones('');
    setGHorizon(2);
  };

  const saveHabit = () => {
    if (!hName.trim()) return;
    addHabit(hName, hEmoji);
    successHaptic();
    setHabitSheet(false);
    setHName('');
    setHEmoji(EMOJIS[0]);
  };

  return (
    <Screen title="Goals" subtitle="What you’re building toward — kept in sight, so it actually happens.">
      <SectionHeader label="Goals" action="+ New goal" onAction={() => setGoalSheet(true)} />
      {goals.length === 0 ? (
        <EmptyState
          line="No goals yet — and that’s okay."
          caption="Start with one. Small enough to finish, big enough to matter."
        />
      ) : (
        goals.map((g) => {
          const done = g.milestones.filter((m) => m.done).length;
          const total = g.milestones.length;
          const daysLeft = g.targetDate ? daysUntil(g.targetDate) : null;
          return (
            <Pressable key={g.id} onPress={() => router.push({ pathname: '/goal/[id]', params: { id: g.id } })}>
              <Card style={{ marginTop: space.sm }}>
                <Text style={styles.goalTitle}>{g.title}</Text>
                <Text style={styles.goalWhy} numberOfLines={2}>
                  {g.why}
                </Text>
                {total > 0 ? (
                  <View style={{ marginTop: space.md }}>
                    <ProgressBar progress={total === 0 ? 0 : done / total} color={tints.goals.color} />
                  </View>
                ) : null}
                <View style={styles.goalMeta}>
                  <Caption>
                    {total > 0 ? `${done}/${total} milestones` : 'No milestones yet'}
                  </Caption>
                  {daysLeft !== null ? (
                    <Caption style={daysLeft < 14 ? { color: colors.accent } : undefined}>
                      {daysLeft >= 0 ? `${daysLeft} days left` : `${-daysLeft} days past`}
                    </Caption>
                  ) : null}
                </View>
              </Card>
            </Pressable>
          );
        })
      )}

      <SectionHeader label="Habits" action="+ New habit" onAction={() => setHabitSheet(true)} />
      {habits.length === 0 ? (
        <EmptyState line="A goal without a habit is a wish." caption="Add a small daily habit to power a goal." />
      ) : (
        habits.map((h) => {
          const s = streak(h.log);
          return (
            <Card key={h.id} style={styles.habitCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <Checkbox
                  checked={!!h.log[today]}
                  onToggle={() => toggleHabit(h.id, today)}
                  color={tints.goals.color}
                />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontFamily: font.medium }}>
                    {h.emoji} {h.name}
                  </Body>
                  <Caption style={{ marginTop: 2 }}>
                    {s > 0 ? `🔥 ${s}-day streak` : 'Start a streak today'}
                  </Caption>
                </View>
                <WeekDots log={h.log} color={tints.goals.color} />
              </View>
            </Card>
          );
        })
      )}

      {/* new goal sheet */}
      <Sheet visible={goalSheet} onClose={() => setGoalSheet(false)} title="A new goal">
        <Micro style={{ marginBottom: space.sm }}>What is it?</Micro>
        <Field value={gTitle} onChangeText={setGTitle} placeholder="Read 12 books this year" />
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Why does it matter?</Micro>
        <Field
          value={gWhy}
          onChangeText={setGWhy}
          placeholder="You’ll be shown this when motivation dips."
          multiline
          style={{ minHeight: 64 }}
        />
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Horizon</Micro>
        <View style={styles.chipRow}>
          {HORIZONS.map((h, i) => (
            <Chip key={h.label} label={h.label} selected={gHorizon === i} onPress={() => setGHorizon(i)} color={tints.goals.color} />
          ))}
        </View>
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>First milestones — one per line</Micro>
        <Field
          value={gMilestones}
          onChangeText={setGMilestones}
          placeholder={'Pick the book\nRead chapter one'}
          multiline
          style={{ minHeight: 80 }}
        />
        <PillButton label="Set the goal" onPress={saveGoal} disabled={!gTitle.trim()} style={{ marginTop: space.xl }} />
      </Sheet>

      {/* new habit sheet */}
      <Sheet visible={habitSheet} onClose={() => setHabitSheet(false)} title="A new habit">
        <Micro style={{ marginBottom: space.sm }}>Small and daily beats big and never</Micro>
        <Field value={hName} onChangeText={setHName} placeholder="Read 20 minutes" />
        <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Pick a face for it</Micro>
        <View style={styles.chipRow}>
          {EMOJIS.map((e) => (
            <Pressable key={e} onPress={() => setHEmoji(e)} style={[styles.emoji, hEmoji === e && styles.emojiSelected]}>
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
        <PillButton label="Start the habit" onPress={saveHabit} disabled={!hName.trim()} style={{ marginTop: space.xl }} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  goalTitle: { fontFamily: font.display, fontSize: 19, lineHeight: 25, color: colors.ink },
  goalWhy: {
    fontFamily: font.serifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkSoft,
    marginTop: 4,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.sm,
  },
  habitCard: { marginTop: space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  emoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  emojiSelected: { borderColor: colors.sage, borderWidth: 2, backgroundColor: colors.sageSoft },
});
