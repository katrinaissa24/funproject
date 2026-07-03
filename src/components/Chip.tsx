import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, font, radius } from '@/theme';

export function Chip({
  label,
  selected,
  onPress,
  color = colors.ink,
  soft = colors.hairlineSoft,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  soft?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? color : soft }]}
      hitSlop={4}
    >
      <Text style={[styles.label, { color: selected ? colors.card : colors.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.chip,
  },
  label: {
    fontFamily: font.medium,
    fontSize: 13,
  },
});
