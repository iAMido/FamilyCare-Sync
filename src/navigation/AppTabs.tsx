import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { TreatmentDetailScreen } from '../screens/treatmentDetail/TreatmentDetailScreen';
import { QuickCreateScreen } from '../screens/quickCreate/QuickCreateScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { FamilyScreen } from '../screens/family/FamilyScreen';
import { PresetManagementScreen } from '../screens/admin/PresetManagementScreen';
import { PresetFormScreen } from '../screens/admin/PresetFormScreen';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/spacing';
import { AppUser } from '../types/User';
import { Preset } from '../types/Preset';

// ── Navigator param lists ────────────────────────────────────────────────────

export type DashboardStackParamList = {
  DashboardHome: undefined;
  TreatmentDetail: { treatmentId: string };
  QuickCreate: undefined;
};

export type HistoryStackParamList = {
  HistoryHome: undefined;
  TreatmentDetail: { treatmentId: string };
};

export type AdminStackParamList = {
  FamilyHome: undefined;
  PresetManagement: undefined;
  PresetForm: { preset: Preset | undefined };
};

// ── Stack navigators ─────────────────────────────────────────────────────────

const Tab       = createBottomTabNavigator();
const DashStack = createStackNavigator<DashboardStackParamList>();
const HistStack = createStackNavigator<HistoryStackParamList>();
const AdminStack= createStackNavigator<AdminStackParamList>();

function DashboardStack() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashStack.Screen name="TreatmentDetail" component={TreatmentDetailScreen} />
      <DashStack.Screen name="QuickCreate" component={QuickCreateScreen} />
    </DashStack.Navigator>
  );
}

function HistoryStack() {
  return (
    <HistStack.Navigator screenOptions={{ headerShown: false }}>
      <HistStack.Screen name="HistoryHome" component={HistoryScreen} />
      <HistStack.Screen name="TreatmentDetail" component={TreatmentDetailScreen} />
    </HistStack.Navigator>
  );
}

function FamilyStack() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="FamilyHome" component={FamilyScreen} />
      <AdminStack.Screen name="PresetManagement" component={PresetManagementScreen} />
      <AdminStack.Screen name="PresetForm" component={PresetFormScreen} />
    </AdminStack.Navigator>
  );
}

// ── Tab icon ─────────────────────────────────────────────────────────────────

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const emoji =
    name === 'Home' ? '🏠' :
    name === 'History' ? '📋' :
    '👨‍👩‍👧‍👦';
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{name}</Text>
    </View>
  );
}

// ── App tabs ─────────────────────────────────────────────────────────────────

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
        component={HistoryStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="History" focused={focused} /> }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Family" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

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
  tabItem: { alignItems: 'center', paddingTop: 6 },
  tabEmoji: { fontSize: 22, opacity: 0.45 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: {
    fontSize: 10, color: Colors.textMuted, marginTop: 2, fontWeight: FontWeight.medium,
  },
  tabLabelActive: { color: Colors.primary, fontWeight: FontWeight.bold },
});
