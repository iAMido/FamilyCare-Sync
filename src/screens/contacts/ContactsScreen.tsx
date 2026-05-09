import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { VaultStackParamList } from '../../navigation/AppTabs';
import { Contact, ContactRole } from '../../types/Contact';
import { getContacts, deleteContact } from '../../services/firestoreService';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useLanguage } from '../../contexts/LanguageContext';

// Note: ContactsScreen is superseded by VaultScreen. Kept for reference only.
type Nav = StackNavigationProp<VaultStackParamList, 'VaultHome'>;

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

export function ContactsScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  function handleDelete(contact: Contact) {
    Alert.alert(
      contact.name,
      'Delete this contact?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteContact(contact.id);
            load();
          },
        },
      ]
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('contacts_title')}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ContactForm', { contact: undefined })}
        >
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👨‍⚕️</Text>
          <Text style={styles.emptyTitle}>{t('contacts_empty')}</Text>
          <Text style={styles.emptySub}>{t('contacts_empty_sub')}</Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => navigation.navigate('ContactForm', { contact: undefined })}
          >
            <Text style={styles.emptyAddText}>{t('add_contact')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ContactRow
              contact={item}
              onEdit={() => navigation.navigate('ContactForm', { contact: item })}
              onDelete={() => handleDelete(item)}
              t={t}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ContactRow({
  contact,
  onEdit,
  onDelete,
  t,
}: {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: any) => string;
}) {
  const icon = ROLE_ICONS[contact.role] ?? '👤';

  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.role}>{t(`role_${contact.role}` as any)}</Text>
          {contact.hospital ? <Text style={styles.sub}>{contact.hospital}{contact.department ? ` · ${contact.department}` : ''}</Text> : null}
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      {(contact.phone || contact.email) ? (
        <View style={styles.actions}>
          {contact.phone ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Linking.openURL(`tel:${contact.phone}`)}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>{t('call')}</Text>
            </TouchableOpacity>
          ) : null}
          {contact.email ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Linking.openURL(`mailto:${contact.email}`)}
            >
              <Text style={styles.actionIcon}>✉️</Text>
              <Text style={styles.actionLabel}>{t('send_email')}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionLabel, { color: Colors.error }]}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionLabel, { color: Colors.error }]}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {contact.notes ? (
        <Text style={styles.notes}>📝 {contact.notes}</Text>
      ) : null}
    </View>
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
  },
  backBtn: { padding: 4, marginRight: Spacing.sm },
  backText: { fontSize: 28, color: Colors.primary, lineHeight: 30 },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 20, color: Colors.textOnPrimary, lineHeight: 24 },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 80 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  role: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, marginTop: 1 },
  sub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  editBtn: { padding: 4 },
  editText: { fontSize: 18 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  deleteBtn: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '25',
  },
  actionIcon: { fontSize: 14 },
  actionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.primary },
  notes: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing.md },
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
    marginBottom: Spacing.lg,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  emptyAddText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textOnPrimary,
  },
});
