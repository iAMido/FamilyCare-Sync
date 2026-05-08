import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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

export function DatePickerModal({ visible, mode, value, minimumDate, onChange, onClose }: Props) {
  const [temp, setTemp] = React.useState(value);

  React.useEffect(() => { if (visible) setTemp(value); }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'date' ? '📅 Select Date' : '🕐 Select Time'}</Text>
          <DateTimePicker
            value={temp}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={mode === 'date' ? minimumDate : undefined}
            onChange={(_, d) => {
              if (!d) { onClose(); return; }
              if (Platform.OS === 'android') {
                onChange(d);
                onClose();
              } else {
                setTemp(d);
              }
            }}
            style={styles.picker}
            textColor={Colors.textPrimary}
            accentColor={Colors.primary}
          />
          {Platform.OS === 'ios' && (
            <View style={styles.buttons}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { onChange(temp); onClose(); }} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: 40,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md },
  picker: { backgroundColor: Colors.surface },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  cancelBtn: { padding: Spacing.md },
  cancelText: { fontSize: FontSize.md, color: Colors.textSecondary },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm },
  confirmText: { fontSize: FontSize.md, color: '#fff', fontWeight: '600' },
});
