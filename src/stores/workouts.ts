import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Workout } from '@/types';

interface WorkoutsState {
  workouts: Workout[];
  add: (workout: Workout) => void;
  remove: (id: string) => void;
}

export const useWorkouts = create<WorkoutsState>()(
  persist(
    (set) => ({
      workouts: [],
      add: (workout) => set((s) => ({ workouts: [workout, ...s.workouts] })),
      remove: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
    }),
    { name: 'aura-workouts', storage: createJSONStorage(() => AsyncStorage) }
  )
);

/** unique exercise names from history, most recent first — for quick re-entry */
export function exerciseHistory(workouts: Workout[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const w of workouts) {
    for (const e of w.exercises) {
      const key = e.name.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        names.push(e.name.trim());
      }
    }
  }
  return names;
}
