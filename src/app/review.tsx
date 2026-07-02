import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { Field } from '@/components/Field';
import { PillButton } from '@/components/PillButton';
import { SectionHeader } from '@/components/SectionHeader';
import { Body, Caption, Display, Micro } from '@/components/typography';
import { addDaysKey, todayKey } from '@/lib/dates';
import { successHaptic } from '@/lib/haptics';
import { useHabits } from '@/stores/habits';
import { useInbox } from '@/stores/inbox';
import { useTasks } from '@/stores/tasks';
import { colors, font, space, tints } from '@/theme';

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const today = todayKey();
  const tomorrow = addDaysKey(today, 1);

  const habits = useHabits((s) => s.habits);
  const toggleHabit = useHabits((s) => s.toggle);
  const unsorted = useInbox((s) => s.items.filter((i) => i.kind === 'unsorted').length);
  const tasks = useTasks((s) => s.tasks);
  const addTask = useTasks((s) => s.addTask);

  const [topTask, setTopTask] = useState('');
  const [closed, setClosed] = useState(false);

  const doneToday = tasks.filter((t) => t.done && t.completedAt?.startsWith(today)).length;
  const openTomorrow = tasks.filter((t) => !t.done && t.due === tomorrow).length;

  const closeDay = () => {
    if (topTask.trim()) {
      addTask({ title: topTask, listId: 'personal', due: tomorrow, priority: true });
    }
    successHaptic();
    setClosed(true);
  };

  if (closed) {
    return (
      <View style={[styles.screen, styles.closedWrap, { paddingTop: insets.top }]}>
        <Text style={styles.closedLine}>The day is closed.</Text>
        <Caption style={{ textAlign: 'center', marginTop: space.sm }}>
          {doneToday > 0 ? `${doneToday} task${doneToday === 1 ? '' : 's'} done today. ` : ''}
          Tomorrow already knows what it’s about. Sleep well.
        </Caption>
        <PillButton label="Good night" onPress={() => router.back()} style={{ marginTop: space.xl, alignSelf: 'center' }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <View>
          <Micro>Evening review</Micro>
          <Display style={{ marginTop: 4 }}>Close the day</Display>
        </View>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={22} color={colors.inkFaint} />
        </Pressable>
      </View>
      <Caption style={{ marginTop: space.sm }}>
        Two minutes, three questions. Then the mess stays out of your head overnight.
      </Caption>

      <SectionHeader label="1 · Did the habits happen?" />
      <Card>
        {habits.length === 0 ? (
          <Caption>No habits yet — add one in Goals.</Caption>
        ) : (
          habits.map((h) => (
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
            </View>
          ))
        )}
      </Card>

      <SectionHeader label="2 · Is the inbox clear?" />
      <Card>
        {unsorted === 0 ? (
          <Body style={{ fontFamily: font.serifItalic }}>Clear. Beautifully clear.</Body>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Body style={{ flex: 1 }}>
              {unsorted} unsorted {unsorted === 1 ? 'thought' : 'thoughts'} left.
            </Body>
            <Pressable
              onPress={() => {
                router.back();
                router.push('/inbox');
              }}
            >
              <Caption style={{ color: colors.accent, fontFamily: font.medium }}>Sort now</Caption>
            </Pressable>
          </View>
        )}
      </Card>

      <SectionHeader label="3 · Tomorrow’s one big thing" />
      <Card>
        <Field
          value={topTask}
          onChangeText={setTopTask}
          placeholder="The single task that would make tomorrow a win"
          multiline
          style={{ borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' }}
        />
        {openTomorrow > 0 ? (
          <Caption style={{ marginTop: space.sm }}>
            {openTomorrow} task{openTomorrow === 1 ? ' is' : 's are'} already scheduled for tomorrow.
          </Caption>
        ) : null}
      </Card>

      <PillButton label="Close the day" onPress={closeDay} style={{ marginTop: space.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8 },
  closedWrap: { justifyContent: 'center', paddingBottom: 80 },
  closedLine: {
    fontFamily: font.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
});
