import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';
import type { DateKey, Goal } from '@/types';

interface GoalsState {
  goals: Goal[];
  addGoal: (input: {
    title: string;
    why: string;
    targetDate?: DateKey;
    milestones: string[];
    habitId?: string;
  }) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  addMilestone: (goalId: string, title: string) => void;
  remove: (id: string) => void;
}

const seed: Goal[] = [
  {
    id: 'seed-reading',
    title: 'Read 12 books this year',
    why: 'To learn faster than my degree teaches me — and reclaim the headspace the mess was eating.',
    milestones: [
      { id: uid(), title: 'Pick the next book', done: false },
      { id: uid(), title: 'Finish book #1', done: false },
      { id: uid(), title: 'Finish book #2', done: false },
    ],
    habitId: 'seed-read-habit',
    createdAt: new Date().toISOString(),
  },
];

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: seed,
      addGoal: ({ title, why, targetDate, milestones, habitId }) =>
        set((s) => ({
          goals: [
            {
              id: uid(),
              title: title.trim(),
              why: why.trim(),
              targetDate,
              milestones: milestones
                .map((m) => m.trim())
                .filter(Boolean)
                .map((m) => ({ id: uid(), title: m, done: false })),
              habitId,
              createdAt: new Date().toISOString(),
            },
            ...s.goals,
          ],
        })),
      toggleMilestone: (goalId, milestoneId) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, done: !m.done } : m
                  ),
                }
              : g
          ),
        })),
      addMilestone: (goalId, title) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, milestones: [...g.milestones, { id: uid(), title: title.trim(), done: false }] }
              : g
          ),
        })),
      remove: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
    }),
    { name: 'aura-goals', storage: createJSONStorage(() => AsyncStorage) }
  )
);
