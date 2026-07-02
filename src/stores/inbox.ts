import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';
import type { IdeaTag, InboxItem, InboxKind } from '@/types';

interface InboxState {
  items: InboxItem[];
  add: (text: string) => void;
  /** sort an unsorted dump into its home inside the inbox */
  sortInto: (id: string, kind: InboxKind, tag?: IdeaTag) => void;
  toggleDone: (id: string) => void;
  remove: (id: string) => void;
}

const seed: InboxItem[] = [
  {
    id: uid(),
    text: 'This is your brain dump. Type anything up top the second it crosses your mind — sorting comes later, and takes one tap.',
    kind: 'unsorted',
    createdAt: new Date().toISOString(),
  },
  {
    id: uid(),
    text: 'Tap me and try “Idea” — ideas get tags so video concepts never mix with startup to-dos again.',
    kind: 'unsorted',
    createdAt: new Date().toISOString(),
  },
];

export const useInbox = create<InboxState>()(
  persist(
    (set) => ({
      items: seed,
      add: (text) =>
        set((s) => ({
          items: [
            { id: uid(), text: text.trim(), kind: 'unsorted' as const, createdAt: new Date().toISOString() },
            ...s.items,
          ],
        })),
      sortInto: (id, kind, tag) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, kind, tag } : i)),
        })),
      toggleDone: (id) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
        })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: 'aura-inbox', storage: createJSONStorage(() => AsyncStorage) }
  )
);
