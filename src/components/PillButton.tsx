import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { tapHaptic } from '@/lib/haptics';
import { colors, font, radius } from '@/theme';

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        primary ? styles.primary : styles.ghost,
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.75 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: primary ? colors.card : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.chip,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.ink },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.inkFaint,
  },
  label: { fontFamily: font.semibold, fontSize: 15 },
});
