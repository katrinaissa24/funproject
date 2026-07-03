import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Caption, Display } from '@/components/typography';
import { colors, space } from '@/theme';

/** Standard tab screen: paper background, safe area, editorial header. */
export function Screen({
  title,
  subtitle,
  headerRight,
  children,
  scroll = true,
}: {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const header = (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Display>{title}</Display>
        {subtitle ? <Caption style={{ marginTop: 4 }}>{subtitle}</Caption> : null}
      </View>
      {headerRight}
    </View>
  );
  if (!scroll) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + space.md }]}>
        {header}
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {header}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: space.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: space.md,
  },
});
