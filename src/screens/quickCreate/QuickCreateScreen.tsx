import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { DatePickerModal } from '../../components/common/DatePickerModal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePresets } from '../../hooks/usePresets';
import { useAuth } from '../../hooks/useAuth';
import { createTreatment, createProtocolGroup } from '../../services/firestoreService';
import { triggerCalendarSync } from '../../services/functionsService';
import { scheduleLocalReminder } from '../../services/notificationService';
import { Preset } from '../../types/Preset';
import { Colors, DotColors } from '../../constants/colors';
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
  const [saving, setSaving] = useState(false);
  const [enabledReminders, setEnabledReminders] = useState<Record<number, boolean>>({});
  // Protocol: which steps are enabled (by index)
  const [enabledSteps, setEnabledSteps] = useState<Record<number, boolean>>({});
  // Cycle tracker
  const [cycleNumber, setCycleNumber] = useState<number>(1);

  function selectPreset(preset: Preset) {
    setSelectedPreset(preset);
    const defaults: Record<number, boolean> = {};
    preset.automatedReminders.forEach((r) => { defaults[r.offsetHours] = true; });
    setEnabledReminders(defaults);
    // Enable all protocol steps by default
    const stepDefaults: Record<number, boolean> = {};
    preset.protocol?.steps?.forEach((_, i) => { stepDefaults[i] = true; });
    setEnabledSteps(stepDefaults);
    // Reset cycle number
    setCycleNumber(1);
    setStep('datetime');
  }

  function toggleReminder(offsetHours: number) {
    setEnabledReminders((p) => ({ ...p, [offsetHours]: !p[offsetHours] }));
  }

  function toggleStep(i: number) {
    setEnabledSteps((p) => ({ ...p, [i]: !p[i] }));
  }

  /** Compute the actual date for a protocol step given offsetDays */
  function stepDate(offsetDays: number): Date {
    return dayjs(date).add(offsetDays, 'day').toDate();
  }

  /** Look up the preset name for a protocol step */
  function stepPresetName(presetId: string): string {
    return presets.find((p) => p.id === presetId)?.name ?? presetId;
  }
  function stepPresetIcon(presetId: string): string {
    return presets.find((p) => p.id === presetId)?.icon ?? '💊';
  }
  function stepPresetLocation(presetId: string): string {
    return presets.find((p) => p.id === presetId)?.defaultLocation ?? '';
  }

  const hasProtocol =
    (selectedPreset?.protocol?.steps?.length ?? 0) > 0;
  const activeStepCount =
    Object.values(enabledSteps).filter(Boolean).length;

  async function handleSave() {
    if (!selectedPreset || !user) return;
    setSaving(true);
    try {
      const hasCycles = (selectedPreset.totalCycles ?? 0) > 0;
      const mainData = {
        presetId: selectedPreset.id,
        title: selectedPreset.name + (hasCycles ? ` (C${cycleNumber}/${selectedPreset.totalCycles})` : ''),
        location: selectedPreset.defaultLocation,
        dateTime: date,
        escortId: null,
        summary: null,
        createdBy: user.uid,
        ...(hasCycles ? { cycleNumber, cycleTotal: selectedPreset.totalCycles } : {}),
      };

      let mainId: string;

      if (hasProtocol && activeStepCount > 0) {
        // Build step appointments
        const steps = (selectedPreset.protocol?.steps ?? [])
          .map((s, i) => ({ s, i }))
          .filter(({ i }) => enabledSteps[i])
          .map(({ s }) => {
            const linkedPreset = presets.find((p) => p.id === s.presetId);
            return {
              presetId: s.presetId,
              title: s.label || linkedPreset?.name || s.presetId,
              location: linkedPreset?.defaultLocation ?? '',
              dateTime: stepDate(s.offsetDays),
              escortId: null,
              summary: null,
              createdBy: user.uid,
            };
          });
        mainId = await createProtocolGroup(mainData, steps);
      } else {
        mainId = await createTreatment(mainData);
      }

      // Schedule local reminders for the main appointment
      const activeReminders = selectedPreset.automatedReminders.filter(
        (r) => enabledReminders[r.offsetHours]
      );
      for (const reminder of activeReminders) {
        await scheduleLocalReminder(
          { id: mainId, title: selectedPreset.name, dateTime: date } as any,
          reminder
        );
      }

      triggerCalendarSync(mainId).catch(() => {});
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to create appointment.');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => (step === 'datetime' ? setStep('preset') : navigation.goBack())}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>{step === 'datetime' ? '← Back' : '✕'}</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          {step === 'preset' ? 'New Appointment' : 'Set Date & Time'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, step === 'preset' ? styles.stepDotActive : styles.stepDotDone]}>
          <Text style={styles.stepDotText}>{step === 'preset' ? '1' : '✓'}</Text>
        </View>
        <View style={[styles.stepLine, step !== 'preset' && styles.stepLineDone]} />
        <View style={[styles.stepDot, step === 'datetime' ? styles.stepDotActive : styles.stepDotInactive]}>
          <Text style={[styles.stepDotText, step !== 'datetime' && styles.stepDotTextInactive]}>2</Text>
        </View>
      </View>

      {/* ── Step 1: Preset selection ── */}
      {step === 'preset' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>What type of appointment?</Text>
          {presets.length === 0 ? (
            <View style={styles.emptyPresets}>
              <Text style={styles.emptyEmoji}>🗂️</Text>
              <Text style={styles.emptyText}>No appointment types yet.</Text>
              <Text style={styles.emptySubText}>Go to Family → Appointment Types to add some.</Text>
            </View>
          ) : (
            <View style={styles.presetGrid}>
              {presets.map((preset, i) => {
                const color = DotColors[i % DotColors.length];
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.presetCard, { borderColor: color + '40', backgroundColor: color + '0C' }]}
                    onPress={() => selectPreset(preset)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.presetIconCircle, { backgroundColor: color + '20' }]}>
                      <Text style={styles.presetIcon}>{preset.icon ?? '💊'}</Text>
                    </View>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    {preset.defaultLocation ? (
                      <Text style={styles.presetLocation} numberOfLines={1}>
                        📍 {preset.defaultLocation}
                      </Text>
                    ) : null}
                    {(preset.protocol?.steps?.length ?? 0) > 0 && (
                      <View style={styles.protocolBadge}>
                        <Text style={styles.protocolBadgeText}>
                          🔗 {preset.protocol!.steps.length} linked
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Step 2: Date, time, protocol, reminders ── */}
      {step === 'datetime' && selectedPreset && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Selected preset pill */}
          <View style={styles.selectedPill}>
            <Text style={styles.selectedPillText}>{selectedPreset.icon ?? '💊'} {selectedPreset.name}</Text>
          </View>

          {/* Date & Time */}
          <Text style={styles.sectionLabel}>Date & Time</Text>
          <View style={styles.dateCard}>
            <TouchableOpacity style={styles.dateRow} onPress={() => setPickerMode('date')}>
              <View style={styles.dateIconBox}><Text style={styles.dateIconEmoji}>📅</Text></View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateRowLabel}>Date</Text>
                <Text style={styles.dateRowValue}>{dayjs(date).format('dddd, D MMMM YYYY')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.dateDivider} />
            <TouchableOpacity style={styles.dateRow} onPress={() => setPickerMode('time')}>
              <View style={styles.dateIconBox}><Text style={styles.dateIconEmoji}>🕐</Text></View>
              <View style={styles.dateInfo}>
                <Text style={styles.dateRowLabel}>Time</Text>
                <Text style={styles.dateRowValue}>{dayjs(date).format('HH:mm')}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          {selectedPreset.defaultLocation ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Location</Text>
              <View style={styles.locationBox}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>{selectedPreset.defaultLocation}</Text>
              </View>
            </>
          ) : null}

          {/* ── Cycle picker ── */}
          {(selectedPreset.totalCycles ?? 0) > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Cycle</Text>
              <View style={styles.cycleBox}>
                <TouchableOpacity
                  style={styles.cycleArrow}
                  onPress={() => setCycleNumber(Math.max(1, cycleNumber - 1))}
                >
                  <Text style={styles.cycleArrowText}>−</Text>
                </TouchableOpacity>
                <View style={styles.cycleCenter}>
                  <Text style={styles.cycleNumber}>{cycleNumber}</Text>
                  <Text style={styles.cycleOf}>of {selectedPreset.totalCycles}</Text>
                </View>
                <TouchableOpacity
                  style={styles.cycleArrow}
                  onPress={() => setCycleNumber(Math.min(selectedPreset.totalCycles!, cycleNumber + 1))}
                >
                  <Text style={styles.cycleArrowText}>＋</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Protocol steps ── */}
          {hasProtocol && (
            <>
              <View style={styles.protocolHeader}>
                <View>
                  <Text style={[styles.sectionLabel, { marginTop: 0 }]}>
                    🔗 Protocol: {activeStepCount} linked appointment{activeStepCount !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.protocolSubtitle}>
                    These will be created automatically alongside this appointment.
                  </Text>
                </View>
              </View>
              {selectedPreset.protocol!.steps.map((s, i) => {
                const enabled = enabledSteps[i] ?? true;
                const sDate = stepDate(s.offsetDays);
                const isBefore = s.offsetDays < 0;
                const absDays = Math.abs(s.offsetDays);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.stepCard, enabled && styles.stepCardActive]}
                    onPress={() => toggleStep(i)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.stepCheck, enabled && styles.stepCheckActive]}>
                      {enabled && <Text style={styles.stepCheckmark}>✓</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.stepTitleRow}>
                        <Text style={styles.stepIcon}>{stepPresetIcon(s.presetId)}</Text>
                        <Text style={styles.stepTitle}>
                          {s.label || stepPresetName(s.presetId)}
                        </Text>
                      </View>
                      <Text style={styles.stepMeta}>
                        📅 {dayjs(sDate).format('ddd, D MMM')}
                        {'  '}
                        <Text style={[styles.stepOffset, isBefore ? styles.stepOffsetBefore : styles.stepOffsetAfter]}>
                          {absDays === 0 ? 'Same day' : `${absDays}d ${isBefore ? 'before' : 'after'}`}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Reminders */}
          {selectedPreset.automatedReminders.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Reminders</Text>
              {selectedPreset.automatedReminders.map((r) => (
                <TouchableOpacity
                  key={r.offsetHours}
                  style={[styles.reminderRow, enabledReminders[r.offsetHours] && styles.reminderRowActive]}
                  onPress={() => toggleReminder(r.offsetHours)}
                >
                  <View style={[styles.reminderCheck, enabledReminders[r.offsetHours] && styles.reminderCheckActive]}>
                    {enabledReminders[r.offsetHours] && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.reminderText}>
                    <Text style={styles.reminderTitle}>{Math.abs(r.offsetHours)}h before</Text>
                    <Text style={styles.reminderMsg}>{r.message}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <Text style={styles.saveBtnText}>
                {hasProtocol && activeStepCount > 0
                  ? `Save ${1 + activeStepCount} Appointments 🔗`
                  : 'Save & Notify Family 🔔'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      <DatePickerModal
        visible={pickerMode !== null}
        mode={pickerMode ?? 'date'}
        value={date}
        minimumDate={pickerMode === 'date' ? new Date() : undefined}
        onChange={(d: Date) => {
          if (pickerMode === 'date') {
            const nd = new Date(d);
            nd.setHours(date.getHours(), date.getMinutes());
            setDate(nd);
          } else {
            const nd = new Date(date);
            nd.setHours(d.getHours(), d.getMinutes());
            setDate(nd);
          }
        }}
        onClose={() => setPickerMode(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  backBtn: { minWidth: 50 },
  backText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  topTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  stepRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.sm, marginBottom: Spacing.sm,
  },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary,
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepDotDone: { backgroundColor: Colors.primaryDark },
  stepDotInactive: { backgroundColor: Colors.border },
  stepDotText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },
  stepDotTextInactive: { color: Colors.textMuted },
  stepLine: { width: 48, height: 2, backgroundColor: Colors.border },
  stepLineDone: { backgroundColor: Colors.primary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sectionLabel: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, marginBottom: Spacing.sm, letterSpacing: 0.3,
  },
  // Preset grid
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetCard: {
    width: '47%', borderRadius: BorderRadius.xl, padding: Spacing.md,
    alignItems: 'center', minHeight: 120, justifyContent: 'center',
    gap: 8, borderWidth: 1.5,
  },
  presetIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
  },
  presetIcon: { fontSize: 28 },
  presetName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  presetLocation: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  protocolBadge: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  protocolBadgeText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.semibold },
  emptyPresets: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', fontWeight: FontWeight.semibold },
  emptySubText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  // Selected pill
  selectedPill: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md,
    paddingVertical: 6, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary + '40',
  },
  selectedPillText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  // Date card
  dateCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.sm,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  dateDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  dateIconBox: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center',
  },
  dateIconEmoji: { fontSize: 18 },
  dateInfo: { flex: 1 },
  dateRowLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  dateRowValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold, marginTop: 1 },
  chevron: { fontSize: FontSize.xl, color: Colors.textMuted },
  // Location
  locationBox: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  locationIcon: { fontSize: 18 },
  locationText: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  // Cycle picker
  cycleBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  cycleArrow: {
    width: 52, height: 52,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.primaryBg,
  },
  cycleArrowText: { fontSize: 24, color: Colors.primary, fontWeight: FontWeight.bold },
  cycleCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cycleNumber: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary,
  },
  cycleOf: { fontSize: FontSize.sm, color: Colors.textMuted },
  // Protocol
  protocolHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  protocolSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  stepCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  stepCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  stepCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepCheckmark: { color: '#fff', fontSize: 13, fontWeight: FontWeight.bold },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  stepIcon: { fontSize: 14 },
  stepTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  stepMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  stepOffset: { fontWeight: FontWeight.semibold },
  stepOffsetBefore: { color: Colors.warning },
  stepOffsetAfter: { color: Colors.primary },
  // Reminders
  reminderRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border,
  },
  reminderRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  reminderCheck: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  reminderCheckActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: FontWeight.bold },
  reminderText: { flex: 1 },
  reminderTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  reminderMsg: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  // Save
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.xl,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
