import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { DatePickerModal } from '../../components/common/DatePickerModal';
import { updateTreatment } from '../../services/firestoreService';
import { showAlert } from '../../utils/alert';
import { Treatment, TreatmentReminder } from '../../types/Treatment';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import dayjs from 'dayjs';

type PickerMode = 'date' | 'time' | null;

interface Props {
  treatment: Treatment;
  onDone: () => void;
}

export function EditTreatmentScreen({ treatment, onDone }: Props) {
  const [title, setTitle] = useState(treatment.title);
  const [location, setLocation] = useState(treatment.location);
  const [date, setDate] = useState(new Date(treatment.dateTime));
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [saving, setSaving] = useState(false);
  const [reminders, setReminders] = useState<TreatmentReminder[]>(treatment.reminders ?? []);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderHours, setNewReminderHours] = useState('24');
  const [newReminderMsg, setNewReminderMsg] = useState('Reminder for upcoming appointment');

  function addReminder() {
    const hours = Math.abs(parseInt(newReminderHours) || 24);
    if (!newReminderMsg.trim()) return;
    setReminders((r) => [...r, { offsetHours: -hours, message: newReminderMsg.trim() }]);
    setNewReminderHours('24');
    setNewReminderMsg('Reminder for upcoming appointment');
    setShowAddReminder(false);
  }

  function updateReminderHours(i: number, val: string) {
    const hours = Math.abs(parseInt(val) || 1);
    setReminders((r) => r.map((rem, idx) => idx === i ? { ...rem, offsetHours: -hours } : rem));
  }

  function updateReminderMsg(i: number, val: string) {
    setReminders((r) => r.map((rem, idx) => idx === i ? { ...rem, message: val } : rem));
  }

  function removeReminder(i: number) {
    setReminders((r) => r.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!title.trim()) {
      showAlert('Title required', 'Please enter a title for the appointment.');
      return;
    }
    setSaving(true);
    try {
      await updateTreatment(treatment.id, {
        title: title.trim(),
        location: location.trim(),
        dateTime: date,
        reminders: reminders.filter((r) => r.message.trim()),
      });
      onDone();
    } catch (err: any) {
      showAlert('Error', err.message ?? 'Failed to update appointment.');
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onDone} style={styles.backBtn}>
          <Text style={styles.backText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Appointment</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Appointment title"
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Hospital, clinic, etc."
          placeholderTextColor={Colors.textMuted}
        />

        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity style={styles.dateRow} onPress={() => setPickerMode('date')}>
          <Text style={styles.dateLabel}>📅  Date</Text>
          <Text style={styles.dateValue}>{dayjs(date).format('dddd, D MMMM YYYY')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateRow} onPress={() => setPickerMode('time')}>
          <Text style={styles.dateLabel}>🕐  Time</Text>
          <Text style={styles.dateValue}>{dayjs(date).format('HH:mm')}</Text>
        </TouchableOpacity>

        {/* Reminders */}
        <View style={styles.reminderHeader}>
          <Text style={styles.label}>Reminders</Text>
          <TouchableOpacity
            onPress={() => setShowAddReminder(!showAddReminder)}
            style={styles.addReminderBtn}
          >
            <Text style={styles.addReminderBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {reminders.length === 0 && !showAddReminder && (
          <Text style={styles.noReminders}>No reminders set.</Text>
        )}

        {reminders.map((r, i) => (
          <View key={i} style={styles.reminderRow}>
            <View style={styles.reminderHoursWrap}>
              <TextInput
                style={styles.reminderHoursInput}
                value={String(Math.abs(r.offsetHours))}
                onChangeText={(v) => updateReminderHours(i, v)}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Text style={styles.reminderHoursLabel}>h before</Text>
            </View>
            <TextInput
              style={styles.reminderMsgInput}
              value={r.message}
              onChangeText={(v) => updateReminderMsg(i, v)}
              placeholder="Reminder message"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity onPress={() => removeReminder(i)} style={styles.reminderRemoveBtn}>
              <Text style={styles.reminderRemoveText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {showAddReminder && (
          <View style={styles.addReminderForm}>
            <View style={styles.reminderHoursWrap}>
              <TextInput
                style={styles.reminderHoursInput}
                value={newReminderHours}
                onChangeText={setNewReminderHours}
                keyboardType="numeric"
                selectTextOnFocus
                autoFocus
              />
              <Text style={styles.reminderHoursLabel}>h before</Text>
            </View>
            <TextInput
              style={styles.reminderMsgInput}
              value={newReminderMsg}
              onChangeText={setNewReminderMsg}
              placeholder="Reminder message"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity onPress={addReminder} style={styles.reminderAddConfirmBtn}>
              <Text style={styles.reminderAddConfirmText}>✓</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={Colors.textOnPrimary} />
            : <Text style={styles.saveBtnText}>💾  Save Changes</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <DatePickerModal
        visible={pickerMode !== null}
        mode={pickerMode ?? 'date'}
        value={date}
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
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  backBtn: { minWidth: 80 },
  backText: { fontSize: FontSize.md, color: Colors.error, fontWeight: FontWeight.medium },
  topTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  dateRow: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  dateLabel: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  dateValue: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xl,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  // Reminders
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  addReminderBtn: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addReminderBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  noReminders: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  addReminderForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  reminderHoursWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderHoursInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    width: 48,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.bold,
  },
  reminderHoursLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  reminderMsgInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  reminderRemoveBtn: {
    padding: 6,
  },
  reminderRemoveText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: FontWeight.bold,
  },
  reminderAddConfirmBtn: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderAddConfirmText: {
    fontSize: 16,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.bold,
  },
});
