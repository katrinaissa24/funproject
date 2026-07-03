import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { successHaptic } from '@/lib/haptics';
import { colors } from '@/theme';

export function Checkbox({
  checked,
  onToggle,
  color = colors.accent,
  size = 24,
}: {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable
      onPress={() => {
        if (!checked) successHaptic();
        onToggle();
      }}
      hitSlop={10}
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size / 2 },
        checked && { backgroundColor: color, borderColor: color },
      ]}
    >
      {checked ? <Feather name="check" size={size * 0.58} color={colors.card} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    borderColor: colors.inkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
