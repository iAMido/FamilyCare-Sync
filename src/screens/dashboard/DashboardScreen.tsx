import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTreatments } from '../../hooks/useTreatments';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../contexts/FamilyContext';
import { updateTreatment } from '../../services/firestoreService';
import { NextTreatmentCard } from './NextTreatmentCard';
import { TreatmentCard } from '../../components/treatment/TreatmentCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/spacing';
import { Treatment } from '../../types/Treatment';
import { DashboardStackParamList } from '../../navigation/AppTabs';
import dayjs from 'dayjs';

type Nav = StackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { state } = useAuth();
  const user = state.status === 'authenticated' ? state.user : null;
  const { treatments, upcoming, nextTreatment, loading, error } = useTreatments();
  const { familyMap } = useFamily();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    // Real-time listener auto-updates; just reset the refreshing state
    setTimeout(() => setRefreshing(false), 600);
  }

  async function handleImGoing() {
    if (!nextTreatment || !user) return;
    await updateTreatment(nextTreatment.id, { escortId: user.uid });
  }

  if (loading) return <LoadingSpinner />;

  // Upcoming (scheduled, future) — excluding the next one shown in hero
  // Group protocol steps under their main appointment
  const upcomingRest = upcoming.filter((t) => {
    if (t.id === nextTreatment?.id) return false;
    // Hide protocol steps — they'll be shown nested under the main appointment
    if (t.protocolRole === 'step') return false;
    return true;
  });

  // Map: protocolGroupId → step appointments (for inline display)
  const protocolStepsMap: Record<string, Treatment[]> = {};
  upcoming.forEach((t) => {
    if (t.protocolRole === 'step' && t.protocolGroupId) {
      if (!protocolStepsMap[t.protocolGroupId]) protocolStepsMap[t.protocolGroupId] = [];
      protocolStepsMap[t.protocolGroupId].push(t);
    }
  });

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';
  const hour = dayjs().hour();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={upcomingRest}
        keyExtractor={(t) => t.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
                <Text style={styles.subtitle}>
                  {upcoming.length === 0
                    ? 'No upcoming appointments'
                    : `${upcoming.length} upcoming appointment${upcoming.length !== 1 ? 's' : ''}`}
                </Text>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
              </View>
            </View>

            {error && <ErrorBanner message={error} />}

            {/* Hero — next appointment */}
            {nextTreatment ? (
              <NextTreatmentCard
                treatment={nextTreatment}
                escortName={nextTreatment.escortId ? familyMap[nextTreatment.escortId] : undefined}
                onPress={() => navigation.navigate('TreatmentDetail', { treatmentId: nextTreatment.id })}
                onEscort={handleImGoing}
                currentUserId={user?.uid ?? ''}
              />
            ) : (
              <View style={styles.emptyHero}>
                <Text style={styles.emptyEmoji}>🌿</Text>
                <Text style={styles.emptyHeroTitle}>All clear!</Text>
                <Text style={styles.emptyHeroSub}>No upcoming appointments. Tap + to add one.</Text>
              </View>
            )}

            {/* Section title */}
            {upcomingRest.length > 0 && (
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <Text style={styles.sectionCount}>{upcomingRest.length}</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const linkedSteps = item.protocolGroupId
            ? (protocolStepsMap[item.protocolGroupId] ?? [])
            : [];
          return (
            <View style={styles.timelineItem}>
              <TreatmentCard
                treatment={item}
                escortName={item.escortId ? familyMap[item.escortId] : undefined}
                onPress={() => navigation.navigate('TreatmentDetail', { treatmentId: item.id })}
                dotColorIndex={index + 1}
              />
              {/* Protocol sub-steps */}
              {linkedSteps.length > 0 && (
                <View style={styles.subSteps}>
                  <View style={styles.subStepsLine} />
                  <View style={styles.subStepsList}>
                    {linkedSteps.map((step) => (
                      <TouchableOpacity
                        key={step.id}
                        style={styles.subStep}
                        onPress={() => navigation.navigate('TreatmentDetail', { treatmentId: step.id })}
                      >
                        <View style={styles.subStepDot} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.subStepTitle}>{step.title}</Text>
                          <Text style={styles.subStepDate}>
                            {dayjs(step.dateTime).format('ddd D MMM · HH:mm')}
                          </Text>
                        </View>
                        <Text style={styles.subStepChevron}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          nextTreatment ? null : (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>
                Tap + below to schedule the first appointment
              </Text>
            </View>
          )
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QuickCreate')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  timelineItem: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
  },
  emptyHero: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyHeroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyHeroSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyList: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Protocol sub-steps
  subSteps: {
    flexDirection: 'row',
    marginLeft: 14,
    marginBottom: Spacing.sm,
    marginTop: -4,
  },
  subStepsLine: {
    width: 2,
    backgroundColor: Colors.primary + '40',
    marginLeft: 12,
    marginRight: 10,
    borderRadius: 1,
  },
  subStepsList: { flex: 1, gap: 4 },
  subStep: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  subStepDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  subStepTitle: {
    fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary,
  },
  subStepDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  subStepChevron: { fontSize: FontSize.lg, color: Colors.textMuted },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.textOnPrimary,
    lineHeight: 32,
    fontWeight: FontWeight.regular,
  },
});
