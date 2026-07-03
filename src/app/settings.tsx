import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { SectionHeader } from '@/components/SectionHeader';
import { Body, Caption, Micro, Title } from '@/components/typography';
import {
  cancelAllNudges,
  notificationsSupported,
  requestPermission,
  scheduleDailyNudges,
} from '@/lib/notifications';
import { useSettings } from '@/stores/settings';
import { colors, space } from '@/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const s = useSettings();

  const [kcal, setKcal] = useState(String(s.kcalTarget));
  const [protein, setProtein] = useState(String(s.proteinTarget));

  const commitTargets = () => {
    const k = parseInt(kcal, 10);
    const p = parseInt(protein, 10);
    s.setTargets(Number.isNaN(k) || k <= 0 ? s.kcalTarget : k, Number.isNaN(p) || p <= 0 ? s.proteinTarget : p);
  };

  const toggleNudges = async (on: boolean) => {
    if (!on) {
      s.setNotificationsEnabled(false);
      await cancelAllNudges();
      return;
    }
    const granted = await requestPermission();
    if (granted) {
      s.setNotificationsEnabled(true);
      await scheduleDailyNudges({ morningHour: s.morningHour, eveningHour: s.eveningHour });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: 80 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Title>Settings</Title>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={22} color={colors.inkFaint} />
        </Pressable>
      </View>

      <SectionHeader label="You" />
      <Card>
        <Micro style={{ marginBottom: space.sm }}>First name — for the morning greeting</Micro>
        <Field value={s.name} onChangeText={s.setName} placeholder="Your name" />
      </Card>

      <SectionHeader label="Daily targets" />
      <Card>
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Micro style={{ marginBottom: space.sm }}>Calories</Micro>
            <Field
              value={kcal}
              onChangeText={setKcal}
              onEndEditing={commitTargets}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Micro style={{ marginBottom: space.sm }}>Protein (g)</Micro>
            <Field
              value={protein}
              onChangeText={setProtein}
              onEndEditing={commitTargets}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </Card>

      <SectionHeader label="Gentle nudges" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Body>Morning check-in & evening review</Body>
            <Caption style={{ marginTop: 2 }}>
              {notificationsSupported()
                ? `Around ${s.morningHour}:30 and ${s.eveningHour}:00. Never guilt, always gentle.`
                : 'Not available in Expo Go on Android — they’ll work in the real app build.'}
            </Caption>
          </View>
          <Switch
            value={s.notificationsEnabled}
            onValueChange={toggleNudges}
            disabled={!notificationsSupported()}
            trackColor={{ true: colors.accent }}
          />
        </View>
      </Card>

      <SectionHeader label="Your data" />
      <Card>
        <Body>Everything lives on this phone.</Body>
        <Caption style={{ marginTop: 4 }}>
          No account, no cloud, no one reading your brain dumps. Accounts and sync can come later, on your terms.
        </Caption>
      </Card>

      <Micro style={{ marginTop: space.xxl, textAlign: 'center' }}>Aura · your life, in one place</Micro>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: space.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
