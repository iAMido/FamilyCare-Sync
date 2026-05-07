import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TreatmentDetailScreen } from '../screens/treatmentDetail/TreatmentDetailScreen';
import { QuickCreateScreen } from '../screens/quickCreate/QuickCreateScreen';
import { Colors } from '../constants/colors';
import { AppUser } from '../types/User';

export type DashboardStackParamList = {
  DashboardHome: undefined;
  TreatmentDetail: { treatmentId: string };
  QuickCreate: undefined;
};

const Tab = createBottomTabNavigator();
const DashStack = createStackNavigator<DashboardStackParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏥',
    Schedule: '📅',
    Profile: '👤',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={styles.tabEmoji}>{icons[name] ?? '●'}</Text>
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

function ProfileScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Profile coming soon</Text>
    </View>
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
        name="Dashboard"
        component={DashboardStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Dashboard" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tabIcon: {
    alignItems: 'center',
    paddingTop: 8,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
});
