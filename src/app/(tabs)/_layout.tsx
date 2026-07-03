import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { useInbox } from '@/stores/inbox';
import { colors, font } from '@/theme';

export default function TabsLayout() {
  const unsorted = useInbox((s) => s.items.filter((i) => i.kind === 'unsorted').length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.paper },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.hairline,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 11 },
        tabBarBadgeStyle: {
          backgroundColor: colors.accent,
          color: colors.card,
          fontFamily: font.semibold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => <Feather name="sun" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarBadge: unsorted > 0 ? unsorted : undefined,
          tabBarIcon: ({ color, size }) => <Feather name="inbox" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, size }) => <Feather name="target" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: 'Body',
          tabBarIcon: ({ color, size }) => <Feather name="activity" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size - 2} color={color} />,
        }}
      />
    </Tabs>
  );
}
