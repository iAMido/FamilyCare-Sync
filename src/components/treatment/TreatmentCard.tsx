import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { Treatment } from '../../types/Treatment';
import { StatusBadge } from './StatusBadge';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

interface Props {
  treatment: Treatment;
  escortName?: string;
  onPress: () => void;
  compact?: boolean;
}

export function TreatmentCard({ treatment, escortName, onPress, compact }: Props) {
  const dt = dayjs(treatment.dateTime);

  return (
    <TouchableOpacity style={[styles.card, compact && styles.compact]} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.left}>
        <View style={styles.dateBlock}>
          <Text style={styles.day}>{dt.format('DD')}</Text>
          <Text style={styles.month}>{dt.format('MMM').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{treatment.title}</Text>
        <Text style={styles.time}>{dt.format('HH:mm')} · {treatment.location}</Text>

        <View style={styles.footer}>
          <StatusBadge status={treatment.status} />
          {escortName ? (
            <Text style={styles.escort}>👤 {escortName}</Text>
          ) : treatment.status === 'scheduled' ? (
            <Text style={styles.unassigned}>⚠️ No escort</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  compact: {
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  left: {
    marginRight: Spacing.md,
  },
  dateBlock: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.sm,
    width: 44,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    lineHeight: 26,
  },
  month: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    lineHeight: 14,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  escort: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  unassigned: {
    fontSize: FontSize.xs,
    color: Colors.warning,
  },
});
