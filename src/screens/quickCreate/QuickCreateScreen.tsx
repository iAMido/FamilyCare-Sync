import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePresets } from '../../hooks/usePresets';
import { useAuth } from '../../hooks/useAuth';
import { createTreatment } from '../../services/firestoreService';
import { triggerCalendarSync } from '../../services/functionsService';
import { scheduleLocalReminder } from '../../services/notificationService';
import { Preset, AutomatedReminder } from '../../types/Preset';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { DashboardStackParamList } from '../../navigation/AppTabs';
import dayjs from 'dayjs';

type Nav = StackNavigationProp<DashboardStackParamList, 'QuickCreate'>;
type Step = 'preset' | 'datetime';
type PickerMode = 'date' | 'time' | null;

export function QuickCreateScreen() {
  const navigation = useNavigation<Nav>();
  const { state } = useAuth();
  const user = state.status === 'authenticated' ? state.user : null;
  const { presets, loading } = usePresets();

  const [step, setStep] = useState<Step>('preset');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [date, setDate] = useState(dayjs().add(1, 'day').hour(10).minute(0).second(0).toDate());
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [tempDate, setTempDate] = useState(date);
  const [saving, setSaving] = useState(false);
  // Reminder toggles — each key is the offsetHours, value is enabled
  const [enabledReminders, setEnabledReminders] = useState<Record<number, boolean>>({});

  function selectPreset(preset: Preset) {
    setSelectedPreset(preset);
    // Default all reminders to enabled
    const defaults: Record<number, boolean> = {};
    preset.automatedReminders.forEach(r => { defaults[r.offsetHours] = true; });
    setEnabledReminders(defaults);
    setStep('datetime');
  }

  function openPicker(mode: PickerMode) {
    setTempDate(date);
    setPickerMode(mode);
  }

  function confirmPicker() {
    setDate(tempDate);
    setPickerMode(null);
  }

  function toggleReminder(offsetHours: number) {
    setEnabledReminders(prev => ({ ...prev, [offsetHours]: !prev[offsetHours] }));
  }

  async function handleSave() {
    if (!selectedPreset || !user) return;
    setSaving(true);
    try {
      const id = await createTreatment({
        presetId: selectedPreset.id,
        title: selectedPreset.name,
        location: selectedPreset.defaultLocation,
        dateTime: date,
        escortId: null,
        summary: null,
        createdBy: user.uid,
      });

      // Only schedule enabled reminders
      const activeReminders = selectedPreset.automatedReminders.filter(
        r => enabledReminders[r.offsetHours]
      );
      for (const reminder of activeReminders) {
        await scheduleLocalReminder({ id, title: selectedPreset.name, dateTime: date } as any, reminder);
      }

      triggerCalendarSync(id).catch(() => {});
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to create appointment.');
      setSaving(false);
    }
  }

  const presetColors = [Colors.primary, '#E8734A', '#4CAF50', '#9C27B0', '#FF5722', '#607D8B', '#00BCD4', '#FF9800'];

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => step === 'datetime' ? setStep('preset') : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {step === 'datetime' ? 'Back' : 'Cancel'}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>New Appointment</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Step 1 — Preset selector */}
      {step === 'preset' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Choose appointment type</Text>
          <View style={styles.presetGrid}>
            {presets.map((preset, i) => (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetCard, { backgroundColor: presetColors[i % presetColors.length] }]}
                onPress={() => selectPreset(preset)}
                activeOpacity={0.8}
              >
                <Text style={styles.presetIcon}>{preset.icon ?? '💊'}</Text>
                <Text style={styles.presetName}>{preset.name}</Text>
                {preset.defaultLocation ? (
                  <Text style={styles.presetLocation} numberOfLines={1}>{preset.defaultLocation}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
          {presets.length === 0 && (
            <View style={styles.emptyPresets}>
              <Text style={styles.emptyText}>No presets configured yet.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Step 2 — Date, time, reminders */}
      {step === 'datetime' && selectedPreset && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.selectedPresetBadge, { backgroundColor: presetColors[presets.indexOf(selectedPreset) % presetColors.length] }]}>
            <Text style={styles.selectedPresetText}>{selectedPreset.icon ?? '💊'} {selectedPreset.name}</Text>
          </View>

          <Text style={styles.sectionLabel}>Date & Time</Text>

          <TouchableOpacity style={styles.dateRow} onPress={() => openPicker('date')}>
            <Text style={styles.dateLabel}>📅  Date</Text>
            <Text style={styles.dateValue}>{dayjs(date).format('dddd, D MMMM YYYY')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateRow} onPress={() => openPicker('time')}>
            <Text style={styles.dateLabel}>🕐  Time</Text>
            <Text style={styles.dateValue}>{dayjs(date).format('HH:mm')}</Text>
          </TouchableOpacity>

          {selectedPreset.defaultLocation ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Location</Text>
              <View style={styles.locationBox}>
                <Text style={styles.locationText}>📍 {selectedPreset.defaultLocation}</Text>
              </View>
            </>
          ) : null}

          {/* Reminders — opt-in toggles */}
          {selectedPreset.automatedReminders.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Reminders</Text>
              <Text style={styles.reminderHint}>Choose which reminders to activate:</Text>
              {selectedPreset.automatedReminders.map((r) => (
                <TouchableOpacity
                  key={r.offsetHours}
                  style={[styles.reminderRow, enabledReminders[r.offsetHours] && styles.reminderRowActive]}
                  onPress={() => toggleReminder(r.offsetHours)}
                >
                  <View style={[styles.reminderCheck, enabledReminders[r.offsetHours] && styles.reminderCheckActive]}>
                    {enabledReminders[r.offsetHours] && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.reminderTextBlock}>
                    <Text style={styles.reminderTitle}>
                      {Math.abs(r.offsetHours)}h before
                    </Text>
                    <Text style={styles.reminderMsg}>{r.message}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.saveBtnText}>💾  Save & Notify Family</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Date/Time Picker Modal */}
      <Modal visible={pickerMode !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {pickerMode === 'date' ? '📅 Select Date' : '🕐 Select Time'}
            </Text>
            <DateTimePicker
              value={tempDate}
              mode={pickerMode ?? 'date'}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={pickerMode === 'date' ? new Date() : undefined}
              onChange={(_, d) => {
                if (d) {
                  if (Platform.OS === 'android') {
                    if (pickerMode === 'date') {
                      const nd = new Date(d);
                      nd.setHours(date.getHours(), date.getMinutes());
                      setDate(nd);
                    } else {
                      const nd = new Date(date);
                      nd.setHours(d.getHours(), d.getMinutes());
                      setDate(nd);
                    }
                    setPickerMode(null);
                  } else {
                    setTempDate(d);
                  }
                } else {
                  setPickerMode(null);
                }
              }}
              style={styles.picker}
              textColor={Colors.textPrimary}
              accentColor={Colors.primary}
            />
            {Platform.OS === 'ios' && (
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setPickerMode(null)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmPicker} style={styles.modalConfirmBtn}>
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  backBtn: { minWidth: 70 },
  backText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium },
  topTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
    letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.xs,
  },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetCard: {
    width: '47%', borderRadius: BorderRadius.xl, padding: Spacing.lg,
    alignItems: 'center', minHeight: 120, justifyContent: 'center',
  },
  presetIcon: { fontSize: 36, marginBottom: Spacing.sm },
  presetName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textOnPrimary, textAlign: 'center' },
  presetLocation: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' },
  emptyPresets: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  selectedPresetBadge: {
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, alignSelf: 'flex-start', marginBottom: Spacing.lg,
  },
  selectedPresetText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textOnPrimary },
  dateRow: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  dateLabel: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  dateValue: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  locationBox: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  locationText: { fontSize: FontSize.md, color: Colors.textPrimary },
  reminderHint: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  reminderRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  reminderRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  reminderCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center',
    marginTop: 1,
  },
  reminderCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: FontWeight.bold },
  reminderTextBlock: { flex: 1 },
  reminderTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  reminderMsg: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: 40,
  },
  modalTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md,
  },
  picker: { backgroundColor: Colors.surface },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  modalCancelBtn: { padding: Spacing.md },
  modalCancelText: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalConfirmBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm,
  },
  modalConfirmText: { fontSize: FontSize.md, color: Colors.textOnPrimary, fontWeight: FontWeight.semibold },
});
