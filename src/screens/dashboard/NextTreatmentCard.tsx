import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Treatment } from '../../types/Treatment';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

dayjs.extend(relativeTime);

interface Props {
  treatment: Treatment;
  escortName?: string;
  onPress: () => void;
  onEscort: () => void;
  currentUserId: string;
}

export function NextTreatmentCard({ treatment, escortName, onPress, onEscort, currentUserId }: Props) {
  const dt = dayjs(treatment.dateTime);
  const isEscortAssigned = !!treatment.escortId;
  const isMyEscort = treatment.escortId === currentUserId;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.headerLabel}>NEXT APPOINTMENT</Text>
        <Text style={styles.relativeTime}>{dt.fromNow()}</Text>
      </View>

      <Text style={styles.title}>{treatment.title}</Text>

      <View style={styles.row}>
        <Text style={styles.meta}>📅 {dt.format('dddd, D MMMM YYYY')}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>🕐 {dt.format('HH:mm')}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>📍 {treatment.location}</Text>
      </View>

      <View style={styles.escortSection}>
        {isEscortAssigned ? (
          <View style={styles.escortAssigned}>
            <Text style={styles.escortIcon}>✅</Text>
            <Text style={styles.escortName}>
              {isMyEscort ? 'You are attending' : `${escortName} is attending`}
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.escortBtn} onPress={onEscort}>
            <Text style={styles.escortBtnText}>✋ I'm Going</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    margin: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.2,
  },
  relativeTime: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
    marginBottom: Spacing.sm,
  },
  row: {
    marginBottom: 4,
  },
  meta: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.88)',
  },
  escortSection: {
    marginTop: Spacing.md,
  },
  escortAssigned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  escortIcon: {
    fontSize: 18,
  },
  escortName: {
    fontSize: FontSize.md,
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
  },
  escortBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  escortBtnText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
