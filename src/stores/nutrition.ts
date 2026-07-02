import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';
import { todayKey } from '@/lib/dates';
import type { Meal } from '@/types';

interface NutritionState {
  meals: Meal[];
  addMeal: (input: { name: string; kcal: number; protein: number }) => void;
  remove: (id: string) => void;
}

export const useNutrition = create<NutritionState>()(
  persist(
    (set) => ({
      meals: [],
      addMeal: ({ name, kcal, protein }) =>
        set((s) => ({
          meals: [
            {
              id: uid(),
              date: todayKey(),
              name: name.trim(),
              kcal: Math.max(0, Math.round(kcal)),
              protein: Math.max(0, Math.round(protein)),
              createdAt: new Date().toISOString(),
            },
            ...s.meals,
          ],
        })),
      remove: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
    }),
    { name: 'aura-nutrition', storage: createJSONStorage(() => AsyncStorage) }
  )
);

/** unique recent meals (by name) for one-tap re-logging */
export function recentMeals(meals: Meal[], limit = 8): Meal[] {
  const seen = new Set<string>();
  const out: Meal[] = [];
  for (const m of meals) {
    const key = m.name.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(m);
      if (out.length >= limit) break;
    }
  }
  return out;
}
