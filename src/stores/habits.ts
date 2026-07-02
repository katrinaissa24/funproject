import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';
import type { DateKey, Habit } from '@/types';

interface HabitsState {
  habits: Habit[];
  addHabit: (name: string, emoji: string) => string;
  toggle: (id: string, day: DateKey) => void;
  remove: (id: string) => void;
}

const seed: Habit[] = [
  { id: 'seed-read-habit', name: 'Read 20 minutes', emoji: '📖', log: {}, createdAt: new Date().toISOString() },
  { id: 'seed-move-habit', name: 'Move your body', emoji: '💪', log: {}, createdAt: new Date().toISOString() },
];

export const useHabits = create<HabitsState>()(
  persist(
    (set) => ({
      habits: seed,
      addHabit: (name, emoji) => {
        const id = uid();
        set((s) => ({
          habits: [...s.habits, { id, name: name.trim(), emoji, log: {}, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      toggle: (id, day) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const log = { ...h.log };
            if (log[day]) delete log[day];
            else log[day] = true;
            return { ...h, log };
          }),
        })),
      remove: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
    }),
    { name: 'aura-habits', storage: createJSONStorage(() => AsyncStorage) }
  )
);
