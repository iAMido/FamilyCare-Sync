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
import { VaultScreen } from '../screens/vault/VaultScreen';
import { ContactFormScreen } from '../screens/contacts/ContactFormScreen';
import { Colors } from '../constants/colors';
import { FontSize, FontWeight } from '../constants/spacing';
import { AppUser } from '../types/User';
import { Preset } from '../types/Preset';
import { Contact } from '../types/Contact';

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

export type VaultStackParamList = {
  VaultHome: undefined;
  ContactForm: { contact: Contact | undefined };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  PresetManagement: undefined;
  PresetForm: { preset: Preset | undefined };
};

// Keep backward-compat alias (some screens import AdminStackParamList)
export type AdminStackParamList = SettingsStackParamList;

// ── Stack navigators ─────────────────────────────────────────────────────────

const Tab          = createBottomTabNavigator();
const DashStack    = createStackNavigator<DashboardStackParamList>();
const HistStack    = createStackNavigator<HistoryStackParamList>();
const VaultStack   = createStackNavigator<VaultStackParamList>();
const SettingsStack= createStackNavigator<SettingsStackParamList>();

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

function VaultStackNavigator() {
  return (
    <VaultStack.Navigator screenOptions={{ headerShown: false }}>
      <VaultStack.Screen name="VaultHome" component={VaultScreen} />
      <VaultStack.Screen name="ContactForm" component={ContactFormScreen} />
    </VaultStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsHome" component={FamilyScreen} />
      <SettingsStack.Screen name="PresetManagement" component={PresetManagementScreen} />
      <SettingsStack.Screen name="PresetForm" component={PresetFormScreen} />
    </SettingsStack.Navigator>
  );
}

// ── Tab icon ─────────────────────────────────────────────────────────────────

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const emoji =
    name === 'Home'     ? '🏠' :
    name === 'History'  ? '📋' :
    name === 'Vault'    ? '🔒' :
                          '⚙️';
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
        name="Vault"
        component={VaultStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Vault" focused={focused} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Settings" focused={focused} /> }}
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
