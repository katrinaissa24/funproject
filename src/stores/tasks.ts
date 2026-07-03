import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { uid } from '@/lib/id';
import { colors } from '@/theme';
import type { DateKey, Task, TaskList } from '@/types';

export const DUMP_LIST_ID = 'from-brain-dump';

const seedLists: TaskList[] = [
  { id: 'startup', name: 'Startup', color: colors.accent },
  { id: 'uni', name: 'Uni', color: colors.slate },
  { id: 'personal', name: 'Personal', color: colors.sage },
  { id: DUMP_LIST_ID, name: 'From Brain Dump', color: colors.ochre },
];

interface TasksState {
  lists: TaskList[];
  tasks: Task[];
  addTask: (input: { title: string; listId: string; due?: DateKey; priority?: boolean }) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  addList: (name: string) => void;
}

export const useTasks = create<TasksState>()(
  persist(
    (set) => ({
      lists: seedLists,
      tasks: [],
      addTask: ({ title, listId, due, priority }) =>
        set((s) => ({
          tasks: [
            {
              id: uid(),
              title: title.trim(),
              listId,
              due,
              priority,
              done: false,
              createdAt: new Date().toISOString(),
            },
            ...s.tasks,
          ],
        })),
      toggle: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : undefined }
              : t
          ),
        })),
      remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addList: (name) =>
        set((s) => ({
          lists: [...s.lists, { id: uid(), name: name.trim(), color: colors.inkSoft }],
        })),
    }),
    { name: 'aura-tasks', storage: createJSONStorage(() => AsyncStorage) }
  )
);
