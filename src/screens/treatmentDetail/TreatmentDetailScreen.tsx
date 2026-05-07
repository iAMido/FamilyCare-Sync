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
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../../components/treatment/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { Treatment } from '../../types/Treatment';
import { AppUser } from '../../types/User';
import { DashboardStackParamList } from '../../navigation/AppTabs';
import dayjs from 'dayjs';
import { PostVisitSummary } from './PostVisitSummary';
import { EscortManager } from './EscortManager';

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
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await updateTreatment(treatmentId, { status: 'cancelled' });
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

  const dt = dayjs(treatment.dateTime);
  const isPast = treatment.dateTime < new Date();
  const escort = family.find((u) => u.uid === treatment.escortId);

  function openMaps() {
    const query = encodeURIComponent(treatment!.location);
    Linking.openURL(`https://maps.google.com/maps?q=${query}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Appointment Details</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.title}>{treatment.title}</Text>
          <StatusBadge status={treatment.status} />
          <View style={styles.metaRows}>
            <Text style={styles.meta}>📅 {dt.format('dddd, D MMMM YYYY')}</Text>
            <Text style={styles.meta}>🕐 {dt.format('HH:mm')}</Text>
            <TouchableOpacity onPress={openMaps}>
              <Text style={[styles.meta, styles.link]}>📍 {treatment.location}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Escort */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escort</Text>
          <EscortManager
            treatment={treatment}
            family={family}
            currentUser={user}
            onUpdate={loadData}
          />
        </View>

        {/* Post-visit */}
        {(isPast || treatment.status === 'completed') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visit Summary</Text>
            <PostVisitSummary
              treatment={treatment}
              currentUser={user}
              onUpdate={loadData}
            />
          </View>
        )}

        {/* Actions */}
        {treatment.status === 'scheduled' && (
          <View style={styles.actions}>
            {isPast && (
              <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={handleComplete}>
                <Text style={styles.actionBtnText}>✅ Mark as Completed</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel}>
              <Text style={[styles.actionBtnText, styles.cancelBtnText]}>✕ Cancel Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    minWidth: 70,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  topTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  metaRows: {
    gap: 6,
    marginTop: Spacing.xs,
  },
  meta: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeBtn: {
    backgroundColor: Colors.success,
  },
  cancelBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  actionBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  cancelBtnText: {
    color: Colors.error,
  },
});
