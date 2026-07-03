import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function ProgressBar({ progress, color = colors.sage }: { progress: number; color?: string }) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.hairlineSoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});
