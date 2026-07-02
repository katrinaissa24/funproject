import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Field } from '@/components/Field';
import { PillButton } from '@/components/PillButton';
import { Body, Caption, Micro, Title } from '@/components/typography';
import { todayKey } from '@/lib/dates';
import { successHaptic, tapHaptic } from '@/lib/haptics';
import { uid } from '@/lib/id';
import { exerciseHistory, useWorkouts } from '@/stores/workouts';
import { colors, space, tints } from '@/theme';
import type { WorkoutExercise } from '@/types';

export default function NewWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const addWorkout = useWorkouts((s) => s.add);
  const history = useWorkouts((s) => exerciseHistory(s.workouts));

  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [draftName, setDraftName] = useState('');

  const addExercise = (name: string) => {
    if (!name.trim()) return;
    setExercises((xs) => [...xs, { id: uid(), name: name.trim(), sets: [{ reps: 10 }] }]);
    setDraftName('');
    tapHaptic();
  };

  const addSet = (exerciseId: string) => {
    setExercises((xs) =>
      xs.map((e) =>
        e.id === exerciseId ? { ...e, sets: [...e.sets, e.sets[e.sets.length - 1] ?? { reps: 10 }] } : e
      )
    );
  };

  const updateSet = (exerciseId: string, index: number, field: 'reps' | 'weight', value: string) => {
    const num = value.trim() === '' ? undefined : parseInt(value, 10);
    setExercises((xs) =>
      xs.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s, i) =>
                i === index ? { ...s, [field]: Number.isNaN(num as number) ? undefined : num } : s
              ),
            }
          : e
      )
    );
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((xs) => xs.filter((e) => e.id !== exerciseId));
  };

  const save = () => {
    addWorkout({
      id: uid(),
      date: todayKey(),
      title: title.trim() || 'Workout',
      exercises: exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s, reps: s.reps || 0 })) })),
    });
    successHaptic();
    router.back();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Title>Log a workout</Title>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={22} color={colors.inkFaint} />
        </Pressable>
      </View>

      <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>Session name</Micro>
      <Field value={title} onChangeText={setTitle} placeholder="Push day, legs, run…" />

      {exercises.map((e) => (
        <Card key={e.id} style={{ marginTop: space.md }}>
          <View style={styles.exerciseHeader}>
            <Body style={{ fontFamily: 'Inter_600SemiBold' }}>{e.name}</Body>
            <Pressable onPress={() => removeExercise(e.id)} hitSlop={10}>
              <Feather name="x" size={15} color={colors.inkFaint} />
            </Pressable>
          </View>
          <View style={styles.setHeader}>
            <Caption style={styles.setCol}>Set</Caption>
            <Caption style={styles.setCol}>Reps</Caption>
            <Caption style={styles.setCol}>kg</Caption>
          </View>
          {e.sets.map((s, i) => (
            <View key={i} style={styles.setRow}>
              <Caption style={styles.setCol}>{i + 1}</Caption>
              <Field
                defaultValue={s.reps ? String(s.reps) : ''}
                onChangeText={(v) => updateSet(e.id, i, 'reps', v)}
                keyboardType="number-pad"
                style={styles.setField}
              />
              <Field
                defaultValue={s.weight != null ? String(s.weight) : ''}
                onChangeText={(v) => updateSet(e.id, i, 'weight', v)}
                keyboardType="number-pad"
                placeholder="—"
                style={styles.setField}
              />
            </View>
          ))}
          <Pressable onPress={() => addSet(e.id)} style={{ marginTop: space.sm }}>
            <Caption style={{ color: tints.body.color, fontFamily: 'Inter_500Medium' }}>+ Add set</Caption>
          </Pressable>
        </Card>
      ))}

      <Micro style={{ marginTop: space.xl, marginBottom: space.sm }}>Add exercise</Micro>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Field
          value={draftName}
          onChangeText={setDraftName}
          onSubmitEditing={() => addExercise(draftName)}
          placeholder="Bench press"
          returnKeyType="done"
          style={{ flex: 1 }}
        />
        <Pressable onPress={() => addExercise(draftName)} style={styles.addBtn} hitSlop={6}>
          <Feather name="plus" size={20} color={colors.card} />
        </Pressable>
      </View>
      {history.length > 0 ? (
        <View style={styles.chipRow}>
          {history.slice(0, 8).map((name) => (
            <Chip key={name} label={name} onPress={() => addExercise(name)} color={tints.body.color} />
          ))}
        </View>
      ) : null}

      <PillButton
        label={exercises.length === 0 ? 'Save session' : `Save · ${exercises.length} exercise${exercises.length === 1 ? '' : 's'}`}
        onPress={save}
        style={{ marginTop: space.xxl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  setHeader: { flexDirection: 'row', gap: space.sm, marginTop: space.md, alignItems: 'center' },
  setRow: { flexDirection: 'row', gap: space.sm, marginTop: 6, alignItems: 'center' },
  setCol: { width: 44 },
  setField: { flex: 1, paddingVertical: 8, textAlign: 'center' },
  addBtn: {
    backgroundColor: colors.ink,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
});
