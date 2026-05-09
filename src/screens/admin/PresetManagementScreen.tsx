import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePresets } from '../../hooks/usePresets';
import { deletePreset } from '../../services/firestoreService';
import { Colors, DotColors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { Preset } from '../../types/Preset';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminStackParamList } from '../../navigation/AppTabs';
import { StackNavigationProp } from '@react-navigation/stack';

type Nav = StackNavigationProp<AdminStackParamList, 'PresetManagement'>;

export function PresetManagementScreen() {
  const navigation = useNavigation<Nav>();
  const { presets, loading } = usePresets();
  const [deleting, setDeleting] = useState<string | null>(null);

  function confirmDelete(preset: Preset) {
    Alert.alert(
      `Delete "${preset.name}"?`,
      'This will not affect existing appointments, but this preset type will no longer be available.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(preset.id);
            await deletePreset(preset.id);
            setDeleting(null);
          },
        },
      ]
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Types</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('PresetForm', { preset: undefined })}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={presets}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗂️</Text>
            <Text style={styles.emptyTitle}>No appointment types yet</Text>
            <Text style={styles.emptySub}>Tap "+ New" to create your first one.</Text>
          </View>
        }
        renderItem={({ item: preset, index }) => {
          const dotColor = DotColors[index % DotColors.length];
          const hasProtocol = (preset.protocol?.steps?.length ?? 0) > 0;
          return (
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: dotColor + '20' }]}>
                <Text style={styles.iconEmoji}>{preset.icon ?? '💊'}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{preset.name}</Text>
                  {hasProtocol && (
                    <View style={styles.protocolBadge}>
                      <Text style={styles.protocolBadgeText}>
                        🔗 {preset.protocol!.steps.length} steps
                      </Text>
                    </View>
                  )}
                </View>
                {preset.defaultLocation ? (
                  <Text style={styles.location} numberOfLines={1}>
                    📍 {preset.defaultLocation}
                  </Text>
                ) : null}
                {preset.automatedReminders?.length > 0 && (
                  <Text style={styles.reminders}>
                    🔔 {preset.automatedReminders.length} reminder{preset.automatedReminders.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('PresetForm', { preset })}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDelete(preset)}
                  disabled={deleting === preset.id}
                >
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  back: { minWidth: 60 },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },
  list: { padding: Spacing.md, paddingBottom: 80, gap: Spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  iconEmoji: { fontSize: 24 },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  protocolBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  protocolBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.semibold },
  location: { fontSize: FontSize.xs, color: Colors.textMuted },
  reminders: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  editBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  deleteBtn: { padding: 6 },
  deleteBtnText: { fontSize: 18 },
  empty: { paddingTop: 60, alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
});
