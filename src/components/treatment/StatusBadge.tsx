import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TreatmentStatus } from '../../types/Treatment';
import { StatusColors } from '../../constants/colors';
import { FontSize, FontWeight, BorderRadius, Spacing } from '../../constants/spacing';

const LABELS: Record<TreatmentStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status }: { status: TreatmentStatus }) {
  const color = StatusColors[status] ?? '#9E9E9E';
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
