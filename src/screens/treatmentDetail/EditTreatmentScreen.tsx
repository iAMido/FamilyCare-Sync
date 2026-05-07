import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert,
  Modal, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { updateTreatment } from '../../services/firestoreService';
import { Treatment } from '../../types/Treatment';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { DashboardStackParamList } from '../../navigation/AppTabs';
import dayjs from 'dayjs';

type EditRouteProp = RouteProp<DashboardStackParamList, 'EditTreatment'>;
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
  const [tempDate, setTempDate] = useState(date);
  const [saving, setSaving] = useState(false);

  function openPicker(mode: PickerMode) {
    setTempDate(date);
    setPickerMode(mode);
  }

  function confirmPicker() {
    setDate(tempDate);
    setPickerMode(null);
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for the appointment.');
      return;
    }
    setSaving(true);
    try {
      await updateTreatment(treatment.id, { title: title.trim(), location: location.trim(), dateTime: date });
      onDone();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to update appointment.');
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
        <TouchableOpacity style={styles.dateRow} onPress={() => openPicker('date')}>
          <Text style={styles.dateLabel}>📅  Date</Text>
          <Text style={styles.dateValue}>{dayjs(date).format('dddd, D MMMM YYYY')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateRow} onPress={() => openPicker('time')}>
          <Text style={styles.dateLabel}>🕐  Time</Text>
          <Text style={styles.dateValue}>{dayjs(date).format('HH:mm')}</Text>
        </TouchableOpacity>

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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: 40,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md },
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
