import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { Treatment } from '../../types/Treatment';
import { Colors, DotColors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

interface Props {
  treatment: Treatment;
  escortName?: string;
  onPress: () => void;
  dotColorIndex?: number;
  compact?: boolean;
}

export function TreatmentCard({ treatment, escortName, onPress, dotColorIndex = 0, compact }: Props) {
  const dt = dayjs(treatment.dateTime);
  const isPast = treatment.dateTime < new Date();
  const dotColor = DotColors[dotColorIndex % DotColors.length];
  const isCancelled = treatment.status === 'cancelled';
  const isCompleted = treatment.status === 'completed';

  return (
    <TouchableOpacity
      style={[styles.row, compact && styles.compact]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Timeline column */}
      <View style={styles.timelineCol}>
        <View style={[styles.dot, { backgroundColor: isCancelled ? Colors.cancelled : dotColor }]} />
        <View style={styles.line} />
      </View>

      {/* Content */}
      <View style={[styles.card, (isCancelled || isCompleted) && styles.cardMuted]}>
        {/* Date badge + time */}
        <View style={styles.cardHeader}>
          <View style={[styles.dateBadge, { backgroundColor: dotColor + '18' }]}>
            <Text style={[styles.dateDay, { color: dotColor }]}>{dt.format('D')}</Text>
            <Text style={[styles.dateMon, { color: dotColor }]}>{dt.format('MMM').toUpperCase()}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={[styles.title, isCancelled && styles.titleStrike]} numberOfLines={1}>
              {treatment.title}
            </Text>
            <Text style={styles.time}>{dt.format('HH:mm')} · {treatment.location}</Text>
          </View>
        </View>

        {/* Footer chips */}
        <View style={styles.footer}>
          {isCancelled && (
            <View style={[styles.statusChip, { backgroundColor: Colors.cancelled + '20' }]}>
              <Text style={[styles.statusText, { color: Colors.cancelled }]}>Cancelled</Text>
            </View>
          )}
          {isCompleted && (
            <View style={[styles.statusChip, { backgroundColor: Colors.success + '20' }]}>
              <Text style={[styles.statusText, { color: Colors.success }]}>Completed</Text>
            </View>
          )}
          {!isCancelled && !isCompleted && (
            <View style={[styles.statusChip, { backgroundColor: Colors.statusScheduled + '18' }]}>
              <Text style={[styles.statusText, { color: Colors.statusScheduled }]}>Scheduled</Text>
            </View>
          )}
          {treatment.cycleNumber != null && (
            <View style={styles.cycleChip}>
              <Text style={styles.cycleText}>
                {'C' + treatment.cycleNumber + (treatment.cycleTotal ? '/' + treatment.cycleTotal : '')}
              </Text>
            </View>
          )}
          {escortName ? (
            <View style={styles.escortChip}>
              <View style={styles.escortDot} />
              <Text style={styles.escortText}>{escortName}</Text>
            </View>
          ) : treatment.status === 'scheduled' ? (
            <View style={styles.noEscortChip}>
              <Text style={styles.noEscortText}>⚠ No escort</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  compact: {
    marginBottom: 0,
  },
  // Timeline
  timelineCol: {
    width: 28,
    alignItems: 'center',
    paddingTop: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginBottom: 0,
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  // Card
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginLeft: 4,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardMuted: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dateBadge: {
    width: 40,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
  },
  dateMon: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    lineHeight: 12,
  },
  cardMeta: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  titleStrike: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  statusChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  cycleChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.primary + '20',
  },
  cycleText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  escortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  escortDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  escortText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  noEscortChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.warningBg,
  },
  noEscortText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
});
