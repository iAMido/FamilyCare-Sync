import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VaultStackParamList } from '../../navigation/AppTabs';
import { Contact, ContactRole } from '../../types/Contact';
import { createContact, updateContact } from '../../services/firestoreService';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { useLanguage } from '../../contexts/LanguageContext';

type Nav = StackNavigationProp<VaultStackParamList, 'ContactForm'>;
type Route = RouteProp<VaultStackParamList, 'ContactForm'>;

const ROLES: ContactRole[] = [
  'oncologist', 'gp', 'nurse', 'pharmacist',
  'nutritionist', 'psychologist', 'coordinator', 'other',
];

const ROLE_ICONS: Record<ContactRole, string> = {
  oncologist: '🩺',
  gp: '👨‍⚕️',
  nurse: '💉',
  pharmacist: '💊',
  nutritionist: '🥗',
  psychologist: '🧠',
  coordinator: '📋',
  other: '👤',
};

export function ContactFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { t } = useLanguage();

  const existing = route.params?.contact;
  const isEditing = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [role, setRole] = useState<ContactRole>(existing?.role ?? 'oncologist');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [hospital, setHospital] = useState(existing?.hospital ?? '');
  const [department, setDepartment] = useState(existing?.department ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      window.alert(t('contact_name') || 'Please enter a name.');
      return;
    }
    setSaving(true);
    try {
      const data: Omit<Contact, 'id' | 'createdAt'> = {
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        hospital: hospital.trim() || undefined,
        department: department.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEditing && existing) {
        await updateContact(existing.id, data);
      } else {
        await createContact(data);
      }
      navigation.goBack();
    } catch (err: any) {
      console.error('Contact save error:', err);
      window.alert('Error: ' + (err.message || 'Failed to save contact.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? t('edit') : t('add_contact')}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{t('save_changes')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Name */}
        <Text style={styles.label}>{t('contact_name')} *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Dr. Sarah Cohen"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Role picker */}
        <Text style={styles.label}>{t('contact_role')}</Text>
        <View style={styles.roleGrid}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleChip, role === r && styles.roleChipActive]}
              onPress={() => setRole(r)}
            >
              <Text style={styles.roleIcon}>{ROLE_ICONS[r]}</Text>
              <Text style={[styles.roleLabel, role === r && styles.roleLabelActive]}>
                {t(`role_${r}` as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone */}
        <Text style={styles.label}>{t('contact_phone')}</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+972 50 000 0000"
          placeholderTextColor={Colors.textMuted}
          keyboardType="phone-pad"
        />

        {/* Email */}
        <Text style={styles.label}>{t('contact_email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="doctor@hospital.com"
          placeholderTextColor={Colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Hospital */}
        <Text style={styles.label}>{t('contact_hospital')}</Text>
        <TextInput
          style={styles.input}
          value={hospital}
          onChangeText={setHospital}
          placeholder="Hadassah Medical Center"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Department */}
        <Text style={styles.label}>{t('contact_department')}</Text>
        <TextInput
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
          placeholder="Oncology"
          placeholderTextColor={Colors.textMuted}
        />

        {/* Notes */}
        <Text style={styles.label}>{t('contact_notes')}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes…"
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={3}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 28, color: Colors.primary, lineHeight: 30 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleIcon: { fontSize: 16 },
  roleLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  roleLabelActive: {
    color: Colors.textOnPrimary,
    fontWeight: FontWeight.semibold,
  },
});
