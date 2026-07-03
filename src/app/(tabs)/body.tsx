import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { Field } from '@/components/Field';
import { PillButton } from '@/components/PillButton';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { Sheet } from '@/components/Sheet';
import { Body, Caption, Heading, Micro } from '@/components/typography';
import { formatShort, todayKey, weekOf } from '@/lib/dates';
import { successHaptic } from '@/lib/haptics';
import { recentMeals, useNutrition } from '@/stores/nutrition';
import { useSettings } from '@/stores/settings';
import { useWorkouts } from '@/stores/workouts';
import { colors, font, space, tints } from '@/theme';

export default function BodyScreen() {
  const today = todayKey();
  const meals = useNutrition((s) => s.meals);
  const addMeal = useNutrition((s) => s.addMeal);
  const removeMeal = useNutrition((s) => s.remove);
  const workouts = useWorkouts((s) => s.workouts);
  const kcalTarget = useSettings((s) => s.kcalTarget);
  const proteinTarget = useSettings((s) => s.proteinTarget);

  const [mealSheet, setMealSheet] = useState(false);
  const [mName, setMName] = useState('');
  const [mKcal, setMKcal] = useState('');
  const [mProtein, setMProtein] = useState('');

  const todayMeals = meals.filter((m) => m.date === today);
  const kcal = todayMeals.reduce((sum, m) => sum + m.kcal, 0);
  const protein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const recents = recentMeals(meals);
  const week = weekOf(today);
  const sessionsThisWeek = workouts.filter((w) => week.includes(w.date)).length;

  const saveMeal = () => {
    const k = parseInt(mKcal, 10);
    const p = parseInt(mProtein, 10) || 0;
    if (!mName.trim() || Number.isNaN(k)) return;
    addMeal({ name: mName, kcal: k, protein: p });
    successHaptic();
    setMealSheet(false);
    setMName('');
    setMKcal('');
    setMProtein('');
  };

  return (
    <Screen title="Body" subtitle="Fuel and movement. Two numbers, one habit — nothing obsessive.">
      {/* nutrition today */}
      <SectionHeader label="Today’s fuel" action="+ Meal" onAction={() => setMealSheet(true)} />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.xl }}>
        <ProgressRing progress={kcal / kcalTarget} size={90} color={tints.body.color}>
          <Heading>{kcal}</Heading>
          <Caption style={{ fontSize: 10 }}>/ {kcalTarget} kcal</Caption>
        </ProgressRing>
        <ProgressRing progress={protein / proteinTarget} size={90} color={tints.body.color}>
          <Heading>{protein}g</Heading>
          <Caption style={{ fontSize: 10 }}>/ {proteinTarget}g protein</Caption>
        </ProgressRing>
        <View style={{ flex: 1 }}>
          <Caption>
            {kcal >= kcalTarget
              ? 'Target met. Nicely fueled.'
              : `${kcalTarget - kcal} kcal to go.`}
          </Caption>
          <Caption style={{ marginTop: 4 }}>
            {protein >= proteinTarget ? 'Protein: done ✓' : `${proteinTarget - protein}g protein left.`}
          </Caption>
        </View>
      </Card>

      {recents.length > 0 ? (
        <>
          <Micro style={{ marginTop: space.lg, marginBottom: space.sm }}>One-tap re-log</Micro>
          <View style={styles.chipRow}>
            {recents.map((m) => (
              <Chip
                key={m.id}
                label={`${m.name} · ${m.kcal}`}
                onPress={() => {
                  addMeal({ name: m.name, kcal: m.kcal, protein: m.protein });
                  successHaptic();
                }}
                color={tints.body.color}
              />
            ))}
          </View>
        </>
      ) : null}

      {todayMeals.length > 0 ? (
        <Card style={{ marginTop: space.lg }}>
          {todayMeals.map((m) => (
            <View key={m.id} style={styles.mealRow}>
              <Body style={{ flex: 1 }}>{m.name}</Body>
              <Caption>
                {m.kcal} kcal · {m.protein}g
              </Caption>
              <Pressable onPress={() => removeMeal(m.id)} hitSlop={10}>
                <Feather name="x" size={15} color={colors.inkFaint} />
              </Pressable>
            </View>
          ))}
        </Card>
      ) : null}

      {/* workouts */}
      <SectionHeader label="Movement" action="+ Log workout" onAction={() => router.push('/workout/new')} />
      <Card>
        <Heading>
          {sessionsThisWeek === 0
            ? 'No sessions yet this week'
            : `${sessionsThisWeek} session${sessionsThisWeek === 1 ? '' : 's'} this week`}
        </Heading>
        <Caption style={{ marginTop: 2 }}>
          {sessionsThisWeek === 0 ? 'The first one is the hardest. Log it and it counts.' : 'Keep the rhythm going.'}
        </Caption>
      </Card>

      {workouts.length === 0 ? (
        <EmptyState line="Your training history starts with one log." />
      ) : (
        workouts.slice(0, 14).map((w) => (
          <Card key={w.id} style={{ marginTop: space.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Body style={{ fontFamily: font.medium }}>{w.title}</Body>
              <Caption>{formatShort(w.date)}</Caption>
            </View>
            <Caption style={{ marginTop: 4 }}>
              {w.exercises.map((e) => `${e.name} ×${e.sets.length}`).join(' · ') || 'No exercises logged'}
            </Caption>
          </Card>
        ))
      )}

      {/* add meal sheet */}
      <Sheet visible={mealSheet} onClose={() => setMealSheet(false)} title="Log a meal">
        <Micro style={{ marginBottom: space.sm }}>What did you eat?</Micro>
        <Field value={mName} onChangeText={setMName} placeholder="Chicken wrap" />
        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg }}>
          <View style={{ flex: 1 }}>
            <Micro style={{ marginBottom: space.sm }}>Calories</Micro>
            <Field value={mKcal} onChangeText={setMKcal} placeholder="450" keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Micro style={{ marginBottom: space.sm }}>Protein (g)</Micro>
            <Field value={mProtein} onChangeText={setMProtein} placeholder="35" keyboardType="number-pad" />
          </View>
        </View>
        <PillButton
          label="Log it"
          onPress={saveMeal}
          disabled={!mName.trim() || !mKcal.trim()}
          style={{ marginTop: space.xl }}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 8,
  },
});
