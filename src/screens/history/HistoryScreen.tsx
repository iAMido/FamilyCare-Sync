import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTreatments } from '../../hooks/useTreatments';
import { Colors, DotColors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { Treatment } from '../../types/Treatment';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { HistoryStackParamList } from '../../navigation/AppTabs';
import { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';

type Nav = StackNavigationProp<HistoryStackParamList, 'HistoryHome'>;

type FilterType = 'all' | 'completed' | 'cancelled';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function HistoryScreen() {
  const navigation = useNavigation<Nav>();
  const { treatments, loading } = useTreatments();
  const [filter, setFilter] = useState<FilterType>('all');

  if (loading) return <LoadingSpinner />;

  // Past appointments (completed or cancelled, or past scheduled)
  const past = treatments.filter((t) => {
    if (t.status === 'completed' || t.status === 'cancelled') return true;
    return t.dateTime < new Date();
  });

  const filtered = filter === 'all'
    ? past
    : past.filter((t) => t.status === filter);

  // Group by month
  const grouped: { month: string; items: Treatment[] }[] = [];
  filtered.forEach((t) => {
    const m = dayjs(t.dateTime).format('MMMM YYYY');
    const last = grouped[grouped.length - 1];
    if (last && last.month === m) {
      last.items.push(t);
    } else {
      grouped.push({ month: m, items: [t] });
    }
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerSub}>{past.length} past appointments</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {grouped.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySub}>Completed and cancelled appointments will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(g) => g.month}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <Text style={styles.groupMonth}>{group.month}</Text>
              {group.items.map((t, idx) => (
                <HistoryRow
                  key={t.id}
                  treatment={t}
                  colorIndex={idx}
                  onPress={() => navigation.navigate('TreatmentDetail', { treatmentId: t.id })}
                />
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function HistoryRow({
  treatment,
  colorIndex,
  onPress,
}: {
  treatment: Treatment;
  colorIndex: number;
  onPress: () => void;
}) {
  const dt = dayjs(treatment.dateTime);
  const dotColor = DotColors[colorIndex % DotColors.length];
  const isCompleted = treatment.status === 'completed';
  const isCancelled = treatment.status === 'cancelled';

  return (
    <TouchableOpacity style={styles.histRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.histTimeline}>
        <View style={[styles.histDot, {
          backgroundColor: isCancelled ? Colors.cancelled : isCompleted ? Colors.success : dotColor,
        }]} />
        <View style={styles.histLine} />
      </View>

      <View style={styles.histCard}>
        <View style={styles.histCardTop}>
          <Text style={[styles.histTitle, isCancelled && styles.histTitleStrike]} numberOfLines={1}>
            {treatment.title}
          </Text>
          <View style={[
            styles.histBadge,
            { backgroundColor: isCancelled ? Colors.cancelled + '20' : Colors.success + '20' },
          ]}>
            <Text style={[
              styles.histBadgeText,
              { color: isCancelled ? Colors.cancelled : Colors.success },
            ]}>
              {isCancelled ? 'Cancelled' : 'Done'}
            </Text>
          </View>
        </View>

        <Text style={styles.histMeta}>
          {dt.format('ddd D MMM')} · {dt.format('HH:mm')} · {treatment.location}
        </Text>

        {treatment.summary ? (
          <Text style={styles.histSummary} numberOfLines={2}>
            📝 {treatment.summary}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  filterLabelActive: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  group: {
    marginBottom: Spacing.md,
  },
  groupMonth: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 32,
  },
  // History row
  histRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  histTimeline: {
    width: 28,
    alignItems: 'center',
    paddingTop: 14,
  },
  histDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  histLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  histCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginLeft: 4,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  histCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  histTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  histTitleStrike: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  histBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  histBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  histMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  histSummary: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
