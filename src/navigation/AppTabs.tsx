import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TreatmentDetailScreen } from '../screens/treatmentDetail/TreatmentDetailScreen';
import { QuickCreateScreen } from '../screens/quickCreate/QuickCreateScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { FamilyScreen } from '../screens/family/FamilyScreen';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/spacing';
import { AppUser } from '../types/User';

export type DashboardStackParamList = {
  DashboardHome: undefined;
  TreatmentDetail: { treatmentId: string };
  QuickCreate: undefined;
};

const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator<DashboardStackParamList>();

// SVG-free icons using emoji/unicode
const TAB_ICONS: Record<string, { default: string; active: string }> = {
  Home: { default: '⌂', active: '⌂' },
  History: { default: '◷', active: '◷' },
  Family: { default: '♡', active: '♡' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {name === 'Home' ? '🏠' : name === 'History' ? '📋' : '👨‍👩‍👧‍👦'}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{name}</Text>
    </View>
  );
}

function DashboardStack() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashStack.Screen name="TreatmentDetail" component={TreatmentDetailScreen} />
      <DashStack.Screen name="QuickCreate" component={QuickCreateScreen} />
    </DashStack.Navigator>
  );
}

export function AppTabs({ user }: { user: AppUser }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} /> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="History" focused={focused} /> }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Family" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabItemActive: {
    // subtle highlight
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.45,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
