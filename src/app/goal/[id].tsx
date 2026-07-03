import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Field } from '@/components/Field';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { WeekDots } from '@/components/WeekDots';
import { Body, Caption, Display, Micro } from '@/components/typography';
import { daysUntil, formatShort, streak } from '@/lib/dates';
import { tapHaptic } from '@/lib/haptics';
import { useGoals } from '@/stores/goals';
import { useHabits } from '@/stores/habits';
import { colors, font, space, tints } from '@/theme';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const goal = useGoals((s) => s.goals.find((g) => g.id === id));
  const toggleMilestone = useGoals((s) => s.toggleMilestone);
  const addMilestone = useGoals((s) => s.addMilestone);
  const removeGoal = useGoals((s) => s.remove);
  const habit = useHabits((s) => s.habits.find((h) => h.id === goal?.habitId));

  const [newMilestone, setNewMilestone] = useState('');

  if (!goal) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + space.md, alignItems: 'center' }]}>
        <Caption>This goal has moved on.</Caption>
      </View>
    );
  }

  const done = goal.milestones.filter((m) => m.done).length;
  const total = goal.milestones.length;
  const daysLeft = goal.targetDate ? daysUntil(goal.targetDate) : null;

  const confirmDelete = () => {
    Alert.alert('Let this goal go?', 'Its milestones go with it. Linked habits stay.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Let it go',
        style: 'destructive',
        onPress: () => {
          removeGoal(goal.id);
          router.back();
        },
      },
    ]);
  };

  const submitMilestone = () => {
    if (!newMilestone.trim()) return;
    addMilestone(goal.id, newMilestone);
    setNewMilestone('');
    tapHaptic();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
        <Pressable onPress={confirmDelete} hitSlop={10}>
          <Feather name="trash-2" size={18} color={colors.inkFaint} />
        </Pressable>
      </View>

      <Display style={{ marginTop: space.md }}>{goal.title}</Display>
      <Text style={styles.why}>{goal.why}</Text>

      <View style={{ marginTop: space.lg }}>
        <ProgressBar progress={total === 0 ? 0 : done / total} color={tints.goals.color} />
        <View style={styles.metaRow}>
          <Caption>{total > 0 ? `${done} of ${total} milestones` : 'No milestones yet'}</Caption>
          {daysLeft !== null && goal.targetDate ? (
            <Caption>
              {formatShort(goal.targetDate)} · {daysLeft >= 0 ? `${daysLeft} days left` : `${-daysLeft} days past`}
            </Caption>
          ) : null}
        </View>
      </View>

      <SectionHeader label="Milestones" />
      <Card>
        {goal.milestones.length === 0 ? (
          <Caption>Break it down — what’s the first small win?</Caption>
        ) : (
          goal.milestones.map((m) => (
            <View key={m.id} style={styles.row}>
              <Checkbox
                checked={m.done}
                onToggle={() => toggleMilestone(goal.id, m.id)}
                color={tints.goals.color}
                size={22}
              />
              <Body style={[{ flex: 1 }, m.done && styles.strike]}>{m.title}</Body>
            </View>
          ))
        )}
        <View style={[styles.row, { marginTop: 4 }]}>
          <Feather name="plus" size={18} color={colors.inkFaint} />
          <Field
            value={newMilestone}
            onChangeText={setNewMilestone}
            onSubmitEditing={submitMilestone}
            placeholder="Add a milestone"
            returnKeyType="done"
            style={styles.milestoneField}
          />
        </View>
      </Card>

      {habit ? (
        <>
          <SectionHeader label="Powered by a habit" />
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Body style={{ fontFamily: font.medium }}>
                  {habit.emoji} {habit.name}
                </Body>
                <Caption style={{ marginTop: 2 }}>
                  {streak(habit.log) > 0 ? `🔥 ${streak(habit.log)}-day streak` : 'Waiting for today’s check.'}
                </Caption>
              </View>
              <WeekDots log={habit.log} color={tints.goals.color} />
            </View>
          </Card>
        </>
      ) : null}

      <Micro style={{ marginTop: space.xxl, textAlign: 'center' }}>
        Small steps, kept visible, become inevitable.
      </Micro>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  why: {
    fontFamily: font.serifItalic,
    fontSize: 16,
    lineHeight: 23,
    color: colors.inkSoft,
    marginTop: space.sm,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8 },
  strike: { textDecorationLine: 'line-through', color: colors.inkFaint },
  milestoneField: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
});
