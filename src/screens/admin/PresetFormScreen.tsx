import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePresets } from '../../hooks/usePresets';
import { createPreset, updatePreset } from '../../services/firestoreService';
import { Colors, DotColors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { Preset, AutomatedReminder, ProtocolStep } from '../../types/Preset';
import { AdminStackParamList } from '../../navigation/AppTabs';
import { StackNavigationProp } from '@react-navigation/stack';

type Nav = StackNavigationProp<AdminStackParamList, 'PresetForm'>;
type RouteProps = RouteProp<AdminStackParamList, 'PresetForm'>;

const ICON_OPTIONS = ['💊','🩺','🏥','🧬','💉','🩸','🫀','🧪','🔬','🩻','🚑','🌡️','💆','🏃','🍎'];

export function PresetFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const existing = route.params?.preset;
  const { presets } = usePresets();

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '💊');
  const [location, setLocation] = useState(existing?.defaultLocation ?? '');
  const [reminders, setReminders] = useState<AutomatedReminder[]>(
    existing?.automatedReminders ?? []
  );
  const [protocolSteps, setProtocolSteps] = useState<ProtocolStep[]>(
    existing?.protocol?.steps ?? []
  );
  const [totalCycles, setTotalCycles] = useState<string>(
    existing?.totalCycles ? String(existing.totalCycles) : ''
  );
  const [saving, setSaving] = useState(false);

  // ── Reminders ──
  function addReminder() {
    setReminders((r) => [...r, { offsetHours: -24, message: 'Reminder for upcoming appointment' }]);
  }
  function updateReminder(i: number, patch: Partial<AutomatedReminder>) {
    setReminders((r) => r.map((rem, idx) => idx === i ? { ...rem, ...patch } : rem));
  }
  function removeReminder(i: number) {
    setReminders((r) => r.filter((_, idx) => idx !== i));
  }

  // ── Protocol steps ──
  function addStep() {
    const firstOtherPreset = presets.find((p) => p.id !== existing?.id);
    setProtocolSteps((s) => [
      ...s,
      { presetId: firstOtherPreset?.id ?? '', offsetDays: -1, label: '' },
    ]);
  }
  function updateStep(i: number, patch: Partial<ProtocolStep>) {
    setProtocolSteps((s) => s.map((step, idx) => idx === i ? { ...step, ...patch } : step));
  }
  function removeStep(i: number) {
    setProtocolSteps((s) => s.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!name.trim()) { window.alert('Please enter a name.'); return; }
    setSaving(true);
    try {
      const parsedCycles = parseInt(totalCycles) || 0;
      const data: Omit<Preset, 'id'> = {
        name: name.trim(),
        icon,
        defaultLocation: location.trim(),
        automatedReminders: reminders,
        protocol: protocolSteps.length > 0
          ? { steps: protocolSteps.filter((s) => s.presetId) }
          : null,
        totalCycles: parsedCycles > 0 ? parsedCycles : null,
      };
      if (existing) {
        await updatePreset(existing.id, data);
      } else {
        await createPreset(data);
      }
      navigation.goBack();
    } catch (err: any) {
      console.error('Preset save error:', err);
      window.alert('Error: ' + (err.message || 'Failed to save.'));
    } finally {
      setSaving(false);
    }
  }

  const otherPresets = presets.filter((p) => p.id !== existing?.id);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{existing ? 'Edit Type' : 'New Type'}</Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={Colors.textOnPrimary} size="small" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Chemotherapy, Blood Test…"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Icon picker */}
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((em) => (
            <TouchableOpacity
              key={em}
              style={[styles.iconOption, icon === em && styles.iconOptionActive]}
              onPress={() => setIcon(em)}
            >
              <Text style={styles.iconEmoji}>{em}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location */}
        <Text style={styles.label}>Default Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Ichilov Hospital, Ward 4"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Total cycles */}
        <Text style={styles.label}>Total Cycles (optional)</Text>
        <TextInput
          style={styles.input}
          value={totalCycles}
          onChangeText={setTotalCycles}
          placeholder="e.g. 6 for a 6-cycle chemo plan (leave blank if N/A)"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
        />

        {/* Reminders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Reminders</Text>
          <TouchableOpacity onPress={addReminder} style={styles.addRowBtn}>
            <Text style={styles.addRowBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {reminders.length === 0 && (
          <Text style={styles.emptyHint}>No reminders. Tap "+ Add" to add one.</Text>
        )}
        {reminders.map((r, i) => (
          <View key={i} style={styles.reminderRow}>
            <View style={styles.reminderLeft}>
              <TextInput
                style={[styles.input, styles.reminderHours]}
                value={String(Math.abs(r.offsetHours))}
                onChangeText={(v) => updateReminder(i, { offsetHours: -(Math.abs(parseInt(v) || 1)) })}
                keyboardType="numeric"
                placeholder="24"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.reminderHoursLabel}>h before</Text>
            </View>
            <TextInput
              style={[styles.input, styles.reminderMsg]}
              value={r.message}
              onChangeText={(v) => updateReminder(i, { message: v })}
              placeholder="Reminder message"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity onPress={() => removeReminder(i)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Protocol steps */}
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Protocol Steps 🔗</Text>
          <TouchableOpacity
            onPress={addStep}
            style={styles.addRowBtn}
            disabled={otherPresets.length === 0}
          >
            <Text style={[styles.addRowBtnText, otherPresets.length === 0 && { opacity: 0.4 }]}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.protocolHint}>
          When this appointment is scheduled, offer to auto-create these linked appointments too.
        </Text>
        {otherPresets.length === 0 && (
          <Text style={styles.emptyHint}>
            Create at least 2 appointment types first before adding protocol steps.
          </Text>
        )}
        {protocolSteps.map((step, i) => {
          const linked = presets.find((p) => p.id === step.presetId);
          const isAfter = step.offsetDays >= 0;
          return (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepRow}>
                {/* Offset */}
                <View style={styles.stepOffset}>
                  <TextInput
                    style={[styles.input, styles.offsetInput]}
                    value={String(Math.abs(step.offsetDays))}
                    onChangeText={(v) => {
                      const abs = Math.abs(parseInt(v) || 0);
                      updateStep(i, { offsetDays: isAfter ? abs : -abs });
                    }}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.offsetToggle}
                    onPress={() => updateStep(i, { offsetDays: -step.offsetDays || 1 })}
                  >
                    <Text style={styles.offsetToggleText}>
                      {isAfter ? 'days after ›' : 'days before ‹'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeStep(i)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Pick which preset */}
              <Text style={styles.stepPickLabel}>Appointment type:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetPicker}>
                {otherPresets.map((p, pi) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.presetChip,
                      step.presetId === p.id && styles.presetChipActive,
                    ]}
                    onPress={() => updateStep(i, { presetId: p.id })}
                  >
                    <Text style={styles.presetChipIcon}>{p.icon ?? '💊'}</Text>
                    <Text style={[
                      styles.presetChipText,
                      step.presetId === p.id && styles.presetChipTextActive,
                    ]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Optional label override */}
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={step.label ?? ''}
                onChangeText={(v) => updateStep(i, { label: v })}
                placeholder={`Title override (optional, default: ${linked?.name ?? '…'})`}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          );
        })}

        <View style={{ height: 60 }} />
      </ScrollView>
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
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  saveBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textOnPrimary },
  content: { padding: Spacing.md, gap: Spacing.xs },
  label: {
    fontSize: FontSize.sm, fontWeight: FontWeight.bold,
    color: Colors.textSecondary, marginTop: Spacing.md, marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 11,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  // Icon grid
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
  },
  iconOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  iconEmoji: { fontSize: 22 },
  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: Spacing.md,
  },
  addRowBtn: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  addRowBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  emptyHint: { fontSize: FontSize.sm, color: Colors.textMuted, marginVertical: 4 },
  protocolHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4, marginTop: 2 },
  // Reminder row
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reminderHours: { width: 52, textAlign: 'center', paddingHorizontal: 6 },
  reminderHoursLabel: { fontSize: FontSize.xs, color: Colors.textMuted, whiteSpace: 'nowrap' } as any,
  reminderMsg: { flex: 1 },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 16, color: Colors.error },
  // Protocol step card
  stepCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stepOffset: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  offsetInput: { width: 52, textAlign: 'center', paddingHorizontal: 6 },
  offsetToggle: {
    backgroundColor: Colors.primaryBg, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  offsetToggleText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  stepPickLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 6 },
  presetPicker: { flexGrow: 0 },
  presetChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: BorderRadius.full, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1.5, borderColor: Colors.border, marginRight: 6,
    backgroundColor: Colors.surface,
  },
  presetChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  presetChipIcon: { fontSize: 14 },
  presetChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  presetChipTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
});
