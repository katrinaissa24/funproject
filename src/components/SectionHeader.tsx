import { Pressable, StyleSheet, View } from 'react-native';

import { Caption, Micro } from '@/components/typography';
import { colors, space } from '@/theme';

export function SectionHeader({
  label,
  action,
  onAction,
}: {
  label: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Micro>{label}</Micro>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Caption style={{ color: colors.accent, fontFamily: 'Inter_500Medium' }}>{action}</Caption>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.xl,
    marginBottom: space.sm,
  },
});
