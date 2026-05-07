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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePresets } from '../../hooks/usePresets';
import { useAuth } from '../../hooks/useAuth';
import { createTreatment } from '../../services/firestoreService';
import { triggerCalendarSync } from '../../services/functionsService';
import { scheduleLocalReminder } from '../../services/notificationService';
import { Preset } from '../../types/Preset';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { DashboardStackParamList } from '../../navigation/AppTabs';
import dayjs from 'dayjs';

type Nav = StackNavigationProp<DashboardStackParamList, 'QuickCreate'>;

type Step = 'preset' | 'datetime';

export function QuickCreateScreen() {
  const navigation = useNavigation<Nav>();
  const { state } = useAuth();
  const user = state.status === 'authenticated' ? state.user : null;
  const { presets, loading } = usePresets();

  const [step, setStep] = useState<Step>('preset');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [date, setDate] = useState(dayjs().add(1, 'day').startOf('hour').toDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  function selectPreset(preset: Preset) {
    setSelectedPreset(preset);
    setStep('datetime');
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

      // Schedule local reminders as a client-side fallback
      for (const reminder of selectedPreset.automatedReminders) {
        await scheduleLocalReminder({ id, title: selectedPreset.name, dateTime: date } as any, reminder);
      }

      // Trigger server-side calendar sync (non-blocking)
      triggerCalendarSync(id).catch(() => {});

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to create appointment.');
      setSaving(false);
    }
  }

  const presetColors = [Colors.primary, '#E8734A', '#4CAF50', '#9C27B0', '#FF5722', '#607D8B'];

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => step === 'datetime' ? setStep('preset') : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← {step === 'datetime' ? 'Back' : 'Cancel'}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>New Appointment</Text>
        <View style={styles.backBtn} />
      </View>

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
              <Text style={styles.emptyText}>
                No presets configured yet.{'\n'}Add presets in Firebase console.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {step === 'datetime' && selectedPreset && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.selectedPresetBadge, { backgroundColor: presetColors[presets.indexOf(selectedPreset) % presetColors.length] }]}>
            <Text style={styles.selectedPresetText}>{selectedPreset.icon ?? '💊'} {selectedPreset.name}</Text>
          </View>

          <Text style={styles.sectionLabel}>Date &amp; Time</Text>

          <TouchableOpacity style={styles.dateRow} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateLabel}>Date</Text>
            <Text style={styles.dateValue}>{dayjs(date).format('dddd, D MMMM YYYY')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateRow} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateLabel}>Time</Text>
            <Text style={styles.dateValue}>{dayjs(date).format('HH:mm')}</Text>
          </TouchableOpacity>

          {(showDatePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, d) => {
                setShowDatePicker(false);
                if (d) setDate(prev => {
                  const nd = new Date(d);
                  nd.setHours(prev.getHours(), prev.getMinutes());
                  return nd;
                });
              }}
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
            />
          )}

          {(showTimePicker) && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={(_, d) => {
                setShowTimePicker(false);
                if (d) setDate(prev => {
                  const nd = new Date(prev);
                  nd.setHours(d.getHours(), d.getMinutes());
                  return nd;
                });
              }}
              display="default"
            />
          )}

          {selectedPreset.defaultLocation ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Location</Text>
              <View style={styles.locationBox}>
                <Text style={styles.locationText}>📍 {selectedPreset.defaultLocation}</Text>
              </View>
            </>
          ) : null}

          {selectedPreset.automatedReminders.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Automatic Reminders</Text>
              {selectedPreset.automatedReminders.map((r, i) => (
                <View key={i} style={styles.reminderRow}>
                  <Text style={styles.reminderText}>
                    🔔 {Math.abs(r.offsetHours)}h before: {r.message}
                  </Text>
                </View>
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
              <Text style={styles.saveBtnText}>Save &amp; Notify Family</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    minWidth: 70,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  topTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetCard: {
    width: '47%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  presetIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  presetName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
    textAlign: 'center',
  },
  presetLocation: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyPresets: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  selectedPresetBadge: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  selectedPresetText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  dateRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  dateValue: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  locationBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  reminderRow: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  reminderText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
