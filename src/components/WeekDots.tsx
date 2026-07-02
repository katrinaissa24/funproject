import { StyleSheet, Text, View } from 'react-native';

import { todayKey, weekOf, WEEKDAY_LETTERS, parseKey } from '@/lib/dates';
import { colors, font } from '@/theme';
import type { DateKey } from '@/types';

/** Mon–Sun dot row showing which days a habit was done this week. */
export function WeekDots({ log, color = colors.sage }: { log: Record<DateKey, true>; color?: string }) {
  const today = todayKey();
  return (
    <View style={styles.row}>
      {weekOf(today).map((key) => {
        const done = !!log[key];
        const isToday = key === today;
        return (
          <View key={key} style={styles.day}>
            <Text style={[styles.letter, isToday && { color: colors.ink, fontFamily: font.semibold }]}>
              {WEEKDAY_LETTERS[parseKey(key).getDay()]}
            </Text>
            <View
              style={[
                styles.dot,
                done && { backgroundColor: color, borderColor: color },
                isToday && !done && { borderColor: colors.ink },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  day: { alignItems: 'center', gap: 4 },
  letter: { fontFamily: font.body, fontSize: 10, color: colors.inkFaint },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.hairline,
  },
});
