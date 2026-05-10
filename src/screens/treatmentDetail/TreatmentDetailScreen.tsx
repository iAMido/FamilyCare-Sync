import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getTreatmentById, updateTreatment } from '../../services/firestoreService';
import { cancelCalendarEvent } from '../../services/functionsService';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { Treatment } from '../../types/Treatment';
import { AppUser } from '../../types/User';
import { DashboardStackParamList } from '../../navigation/AppTabs';
import dayjs from 'dayjs';
import { PostVisitSummary } from './PostVisitSummary';
import { EscortManager } from './EscortManager';
import { EditTreatmentScreen } from './EditTreatmentScreen';
import { SideEffectLogger } from './SideEffectLogger';
import { SideEffect } from '../../types/Treatment';

type TreatmentDetailRouteProp = RouteProp<DashboardStackParamList, 'TreatmentDetail'>;

export function TreatmentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<TreatmentDetailRouteProp>();
  const { treatmentId } = route.params;
  const { state } = useAuth();
  const user = state.status === 'authenticated' ? state.user : null;

  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [family, setFamily] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  async function loadData() {
    const [t, famSnap] = await Promise.all([
      getTreatmentById(treatmentId),
      getDocs(collection(db, 'users')),
    ]);
    setTreatment(t);
    setFamily(famSnap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<AppUser, 'uid'>) })));
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [treatmentId]);

  async function handleCancel() {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel Appointment',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelCalendarEvent(treatmentId);
          } catch (err) {
            console.error('cancelCalendarEvent failed, falling back', err);
            await updateTreatment(treatmentId, { status: 'cancelled' });
          }
          await loadData();
        },
      },
    ]);
  }

  async function handleComplete() {
    await updateTreatment(treatmentId, { status: 'completed' });
    await loadData();
  }

  if (loading || !treatment) return <LoadingSpinner />;

  if (editing) {
    return (
      <EditTreatmentScreen
        treatment={treatment}
        onDone={() => { setEditing(false); loadData(); }}
      />
    );
  }

  const dt = dayjs(treatment.dateTime);
  const isPast = treatment.dateTime < new Date();
  const isScheduled = treatment.status === 'scheduled';
  const isCompleted = treatment.status === 'completed';
  const isCancelled = treatment.status === 'cancelled';

  function openMaps() {
    const query = encodeURIComponent(treatment!.location);
    Linking.openURL(`https://maps.google.com/maps?q=${query}`);
  }

  const statusColor = isCancelled
    ? Colors.statusCancelled
    : isCompleted
    ? Colors.statusCompleted
    : Colors.statusScheduled;

  const statusLabel = isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : 'Scheduled';

  async function handleSideEffectsChange(effects: SideEffect[]) {
    await updateTreatment(treatmentId, { sideEffects: effects });
    await loadData();
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Details</Text>
        {isScheduled ? (
          <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit ✏️</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          {/* Status badge + cycle badge row */}
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
            {treatment.cycleNumber != null && (
              <View style={styles.cycleBadge}>
                <Text style={styles.cycleBadgeText}>
                  {'C' + treatment.cycleNumber + (treatment.cycleTotal ? '/' + treatment.cycleTotal : '')}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.heroTitle}>{treatment.title}</Text>

          {/* Meta chips */}
          <View style={styles.metaList}>
            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <Text style={styles.metaIconText}>📅</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>{dt.format('dddd, D MMMM YYYY')}</Text>
              </View>
            </View>

            <View style={styles.metaSeparator} />

            <View style={styles.metaItem}>
              <View style={styles.metaIcon}>
                <Text style={styles.metaIconText}>🕐</Text>
              </View>
              <View>
                <Text style={styles.metaLabel}>Time</Text>
                <Text style={styles.metaValue}>{dt.format('HH:mm')}</Text>
              </View>
            </View>

            <View style={styles.metaSeparator} />

            <TouchableOpacity style={styles.metaItem} onPress={openMaps}>
              <View style={styles.metaIcon}>
                <Text style={styles.metaIconText}>📍</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>Location</Text>
                <Text style={[styles.metaValue, styles.metaLink]} numberOfLines={1}>
                  {treatment.location}
                </Text>
              </View>
              <Text style={styles.metaChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escort section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escort</Text>
          <EscortManager
            treatment={treatment}
            family={family}
            currentUser={user}
            onUpdate={loadData}
          />
        </View>

        {/* Post-visit summary */}
        {(isPast || isCompleted) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Summary</Text>
            <PostVisitSummary
              treatment={treatment}
              currentUser={user}
              onUpdate={loadData}
            />
          </View>
        )}

        {/* Side effect logger — shown after the appointment date */}
        {(isPast || isCompleted || isCancelled) && (
          <View style={styles.sideEffectsSection}>
            <SideEffectLogger
              sideEffects={treatment.sideEffects ?? []}
              onChange={handleSideEffectsChange}
              readonly={isCancelled}
            />
          </View>
        )}

        {/* Actions */}
        {isScheduled && (
          <View style={styles.actions}>
            {isPast && (
              <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={handleComplete}>
                <Text style={styles.actionBtnText}>✅ Mark as Completed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>✕ Cancel Appointment</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    minWidth: 70,
  },
  editBtn: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  editBtnText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  topTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.md,
  },
  // Hero card
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cycleBadge: {
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cycleBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  metaList: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  metaSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  metaIcon: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaIconText: {
    fontSize: 16,
  },
  metaLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  metaValue: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    marginTop: 1,
  },
  metaLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  metaChevron: {
    fontSize: FontSize.xl,
    color: Colors.textMuted,
  },
  // Sections
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  sideEffectsSection: {
    marginBottom: Spacing.md,
  },
  // Actions
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    borderRadius: BorderRadius.xl,
    paddingVertical: 15,
    alignItems: 'center',
  },
  completeBtn: {
    backgroundColor: Colors.success,
  },
  actionBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  cancelBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.error + '60',
  },
  cancelBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});
