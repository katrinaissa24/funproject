import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  name: string;
  notificationsEnabled: boolean;
  morningHour: number;
  eveningHour: number;
  kcalTarget: number;
  proteinTarget: number;
  setName: (name: string) => void;
  setNotificationsEnabled: (on: boolean) => void;
  setTargets: (kcal: number, protein: number) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      notificationsEnabled: false,
      morningHour: 8,
      eveningHour: 21,
      kcalTarget: 2000,
      proteinTarget: 110,
      setName: (name) => set({ name: name.trim() }),
      setNotificationsEnabled: (on) => set({ notificationsEnabled: on }),
      setTargets: (kcal, protein) => set({ kcalTarget: kcal, proteinTarget: protein }),
    }),
    { name: 'aura-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
