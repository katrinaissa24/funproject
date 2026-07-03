import { StyleSheet, Text, View } from 'react-native';

import { Caption } from '@/components/typography';
import { colors, font, space } from '@/theme';

export function EmptyState({ line, caption }: { line: string; caption?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.line}>{line}</Text>
      {caption ? <Caption style={{ textAlign: 'center', marginTop: space.sm }}>{caption}</Caption> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: space.xxl,
    paddingHorizontal: space.xl,
    alignItems: 'center',
  },
  line: {
    fontFamily: font.serifItalic,
    fontSize: 18,
    lineHeight: 26,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
