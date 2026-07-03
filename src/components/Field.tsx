import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, font, radius } from '@/theme';

export const Field = forwardRef<TextInput, TextInputProps>(function Field(
  { style, ...rest },
  ref
) {
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.inkFaint}
      {...rest}
      style={[styles.field, style]}
    />
  );
});

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderRadius: radius.field,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: font.body,
    fontSize: 15,
    color: colors.ink,
  },
});
