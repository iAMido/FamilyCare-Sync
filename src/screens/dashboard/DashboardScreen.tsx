import React, { useState, useEffect } from 'react';
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
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTreatments } from '../../hooks/useTreatments';
import { useAuth } from '../../hooks/useAuth';
import { updateTreatment } from '../../services/firestoreService';
import { NextTreatmentCard } from './NextTreatmentCard';
import { TreatmentCard } from '../../components/treatment/TreatmentCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { Colors } from '../../constants/colors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../../constants/spacing';
import { AppUser } from '../../types/User';
import { DashboardStackParamList } from '../../navigation/AppTabs';

type Nav = StackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { state } = useAuth();
  const user = state.status === 'authenticated' ? state.user : null;
  const { treatments, upcoming, nextTreatment, loading, error } = useTreatments();
  const [familyMap, setFamilyMap] = useState<Record<string, string>>({});

  useEffect(() => {
    getDocs(collection(db, 'users')).then((snap) => {
      const map: Record<string, string> = {};
      snap.forEach((d) => { map[d.id] = d.data().displayName ?? d.id; });
      setFamilyMap(map);
    });
  }, []);

  async function handleImGoing() {
    if (!nextTreatment || !user) return;
    await updateTreatment(nextTreatment.id, { escortId: user.uid });
  }

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>{upcoming.length} upcoming appointment{upcoming.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {error && <ErrorBanner message={error} />}

      <FlatList
        data={treatments.filter((t) => t !== nextTreatment)}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {nextTreatment ? (
              <NextTreatmentCard
                treatment={nextTreatment}
                escortName={nextTreatment.escortId ? familyMap[nextTreatment.escortId] : undefined}
                onPress={() => navigation.navigate('TreatmentDetail', { treatmentId: nextTreatment.id })}
                onEscort={handleImGoing}
                currentUserId={user?.uid ?? ''}
              />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🌟</Text>
                <Text style={styles.emptyText}>No upcoming appointments</Text>
              </View>
            )}

            {treatments.length > 1 && (
              <Text style={styles.sectionTitle}>All Appointments</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TreatmentCard
            treatment={item}
            escortName={item.escortId ? familyMap[item.escortId] : undefined}
            onPress={() => navigation.navigate('TreatmentDetail', { treatmentId: item.id })}
          />
        )}
        ListEmptyComponent={
          treatments.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>
                Tap + to schedule the first appointment
              </Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QuickCreate')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    margin: Spacing.md,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: Colors.textOnPrimary,
    lineHeight: 34,
  },
});
