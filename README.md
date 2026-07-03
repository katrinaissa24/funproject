# Aura — your life, in one place

A personal life-manager app: one calm home for the brain dumps, tasks, goals, habits, workouts, meals, and calendar that used to live in seven different apps. Built with **Expo / React Native** — one codebase that runs in Expo Go today and can ship to both the App Store and Google Play later.

Everything is stored **locally on your phone**. No account, no cloud, no one reading your brain dumps.

## Run it on your phone (Expo Go)

1. Install **Expo Go** from the App Store or Google Play.
2. On your computer:

   ```bash
   npm install
   npx expo start
   ```

3. Scan the QR code from the terminal — camera app on iPhone, the Expo Go app on Android. The app loads on your phone in seconds, and hot-reloads as the code changes.

> Phone and computer need to be on the same Wi-Fi. If the connection is fussy, try `npx expo start --tunnel`.

## What's inside

| Tab | What it does |
|---|---|
| **Today** | The manager's desk: a greeting, *Today's Focus* (the 1–3 things that matter most, picked automatically from your tasks, goals, and habits), today's agenda, habit checklist, calorie & protein rings, and — after 8pm — the evening review. |
| **Inbox** | The brain dump. Type a thought, hit enter, it's captured. Later, one tap sorts each thought into a task, idea (tagged video/marketing/startup/random), shopping item, note, or goal — or lets it go. The tab badge shows how many thoughts are waiting. |
| **Goals** | Goals with a *why* (shown back to you), target dates, and milestones — plus daily habits with streaks and a week dot-row. Goals feed Today's Focus so they stay in view without you thinking about them. |
| **Body** | Quick meal logging (calories + protein, with one-tap re-log of recent meals) against daily targets, and a workout logger with exercises, sets × reps × weight, and history-based suggestions. |
| **Plan** | Week strip + day agenda merging events and due tasks, and the full task list organized by list (Startup, Uni, Personal, From Brain Dump). |

Plus a **2-minute evening review** (check habits, clear the inbox, pick tomorrow's one big thing) and **gentle daily nudges** — a morning check-in and evening review reminder via local notifications, toggleable in Settings.

> Note: notifications don't work in Expo Go on Android (an Expo Go limitation) — they work on iOS Expo Go and in real app builds.

## Tech

- **Expo SDK 57** + TypeScript, **expo-router** file-based navigation
- **zustand** stores persisted to **AsyncStorage** (all data on-device)
- **Fraunces** serif + **Inter** via `@expo-google-fonts`, custom "paper & ink" design system (`src/theme.ts`)
- `react-native-svg` progress rings, `expo-haptics`, `expo-notifications`

```
src/
  app/            screens (expo-router): (tabs)/, goal/[id], workout/new, review, settings
  components/     Card, ProgressRing, Checkbox, Sheet, Chip, WeekDots, ...
  stores/         zustand stores: inbox, tasks, goals, habits, workouts, nutrition, events, settings
  lib/            dates, focus algorithm, notifications, haptics
  theme.ts        design tokens
```

## Shipping to the stores (later)

When you're ready for the App Store / Google Play, this same codebase ships with [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

You'll need an Apple Developer account ($99/yr) and a Google Play developer account ($25 once). Notifications, icons, and splash are already configured.
