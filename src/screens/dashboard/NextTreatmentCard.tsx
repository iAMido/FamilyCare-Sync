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
  const daysUntil = dt.diff(dayjs(), 'day');
  const hoursUntil = dt.diff(dayjs(), 'hour');
  const isUrgent = hoursUntil <= 24 && hoursUntil > 0;
  const isSoon = daysUntil <= 3 && daysUntil > 0;

  function countdownLabel() {
    if (hoursUntil < 1) return 'Starting soon';
    if (hoursUntil < 24) return `In ${hoursUntil}h`;
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.labelPill}>
          <Text style={styles.labelText}>NEXT APPOINTMENT</Text>
        </View>
        <View style={[styles.countdownPill, isUrgent && styles.countdownUrgent]}>
          <Text style={[styles.countdownText, isUrgent && styles.countdownTextUrgent]}>
            {countdownLabel()}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{treatment.title}</Text>

      {/* Meta chips */}
      <View style={styles.chips}>
        <View style={styles.chip}>
          <Text style={styles.chipIcon}>📅</Text>
          <Text style={styles.chipText}>{dt.format('ddd, D MMM YYYY')}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipIcon}>🕐</Text>
          <Text style={styles.chipText}>{dt.format('HH:mm')}</Text>
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipIcon}>📍</Text>
          <Text style={styles.chipText} numberOfLines={1}>{treatment.location}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Escort */}
      <View style={styles.escortRow}>
        {isEscortAssigned ? (
          <>
            <View style={styles.escortAvatar}>
              <Text style={styles.escortAvatarText}>
                {(escortName ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.escortLabel}>
              {isMyEscort ? '✅ You are attending' : `✅ ${escortName} is attending`}
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.escortAvatar, styles.escortAvatarEmpty]}>
              <Text style={styles.escortAvatarEmptyIcon}>?</Text>
            </View>
            <Text style={styles.escortUnassigned}>No escort yet</Text>
            <TouchableOpacity style={styles.imGoingBtn} onPress={onEscort}>
              <Text style={styles.imGoingText}>I'm Going ✋</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  labelPill: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  labelText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  countdownPill: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countdownUrgent: {
    backgroundColor: Colors.warningBg,
  },
  countdownText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  countdownTextUrgent: {
    color: Colors.warning,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  chips: {
    gap: 6,
    marginBottom: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  escortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  escortAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  escortAvatarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  escortAvatarEmpty: {
    backgroundColor: Colors.surfaceVariant,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  escortAvatarEmptyIcon: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  escortLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  escortUnassigned: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    flex: 1,
  },
  imGoingBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  imGoingText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
});
