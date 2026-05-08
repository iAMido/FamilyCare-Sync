import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize } from '../../constants/spacing';

interface Props {
  visible: boolean;
  mode: 'date' | 'time';
  value: Date;
  minimumDate?: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export function DatePickerModal({ visible, mode, value, minimumDate, onChange, onClose }: Props) {
  const dateStr = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  const timeStr = `${pad(value.getHours())}:${pad(value.getMinutes())}`;
  const minStr = minimumDate
    ? `${minimumDate.getFullYear()}-${pad(minimumDate.getMonth() + 1)}-${pad(minimumDate.getDate())}`
    : undefined;

  function handleChange(e: any) {
    const val = e.target.value;
    const nd = new Date(value);
    if (mode === 'date') {
      const [y, m, d] = val.split('-').map(Number);
      nd.setFullYear(y, m - 1, d);
    } else {
      const [h, min] = val.split(':').map(Number);
      nd.setHours(h, min, 0, 0);
    }
    onChange(nd);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'date' ? '📅 Select Date' : '🕐 Select Time'}</Text>
          {React.createElement('input', {
            type: mode === 'date' ? 'date' : 'time',
            value: mode === 'date' ? dateStr : timeStr,
            min: mode === 'date' ? minStr : undefined,
            onChange: handleChange,
            style: {
              fontSize: 18, padding: 12, borderRadius: 8,
              border: `1px solid ${Colors.border}`, width: '100%',
              marginBottom: 16, color: Colors.textPrimary,
              backgroundColor: Colors.background, boxSizing: 'border-box',
            },
          })}
          <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, width: '100%', maxWidth: 380 },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md },
  doneBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
});
