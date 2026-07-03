import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';
import type { CalendarEvent, DateKey } from '@/types';

interface EventsState {
  events: CalendarEvent[];
  add: (input: { title: string; date: DateKey; start?: string; durationMin?: number }) => void;
  remove: (id: string) => void;
}

export const useEvents = create<EventsState>()(
  persist(
    (set) => ({
      events: [],
      add: ({ title, date, start, durationMin }) =>
        set((s) => ({
          events: [...s.events, { id: uid(), title: title.trim(), date, start, durationMin }],
        })),
      remove: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'aura-events', storage: createJSONStorage(() => AsyncStorage) }
  )
);
