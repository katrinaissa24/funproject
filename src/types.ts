/** Shared domain types. Dates: `DateKey` is a local 'YYYY-MM-DD' string. */

export type DateKey = string;

// ---- Inbox (brain dump) ----

export type IdeaTag = 'video' | 'marketing' | 'startup' | 'random';

export type InboxKind = 'unsorted' | 'idea' | 'shopping' | 'note';

export interface InboxItem {
  id: string;
  text: string;
  kind: InboxKind;
  tag?: IdeaTag;
  /** for shopping items */
  done?: boolean;
  createdAt: string; // ISO
}

// ---- Tasks ----

export interface TaskList {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  listId: string;
  due?: DateKey;
  priority?: boolean;
  done: boolean;
  completedAt?: string; // ISO
  createdAt: string; // ISO
}

// ---- Goals & habits ----

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  why: string;
  targetDate?: DateKey;
  milestones: Milestone[];
  /** optional habit powering this goal */
  habitId?: string;
  createdAt: string; // ISO
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  /** set of DateKeys on which the habit was completed */
  log: Record<DateKey, true>;
  createdAt: string; // ISO
}

// ---- Body: workouts & nutrition ----

export interface WorkoutSet {
  reps: number;
  weight?: number; // kg
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: DateKey;
  title: string;
  exercises: WorkoutExercise[];
}

export interface Meal {
  id: string;
  date: DateKey;
  name: string;
  kcal: number;
  protein: number; // grams
  createdAt: string; // ISO
}

// ---- Calendar ----

export interface CalendarEvent {
  id: string;
  title: string;
  date: DateKey;
  /** 'HH:MM' 24h, optional for all-day */
  start?: string;
  durationMin?: number;
}

// ---- Focus (computed, not stored) ----

export type FocusItem = {
  key: string;
  kind: 'overdue' | 'due' | 'goal' | 'habit' | 'inbox';
  title: string;
  detail: string;
};
