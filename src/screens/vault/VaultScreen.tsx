import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
import { useLanguage } from '../../contexts/LanguageContext';

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

const ROLE_COLORS: Record<ContactRole, string> = {
  oncologist: '#C97BBD',
  gp: '#6B9E7A',
  nurse: '#7B9ED9',
  pharmacist: '#5BB5C3',
  nutritionist: '#E8734A',
  psychologist: '#9B7FD4',
  coordinator: '#F5A623',
  other: '#9E9E9E',
};

export function VaultScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getContacts()
        .then(setContacts)
        .catch(() => setContacts([]))
        .finally(() => setLoading(false));
    }, []),
  );

  function confirmDelete(contact: Contact) {
    Alert.alert(contact.name, t('delete') + '?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteContact(contact.id).catch(() => {});
          setContacts((c) => c.filter((x) => x.id !== contact.id));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vault 🔒</Text>
          <Text style={styles.headerSub}>Contacts & documents</Text>
        </View>

        {/* ── Contacts section ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('contacts_title')}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('ContactForm', { contact: undefined })}
          >
            <Text style={styles.addBtnText}>＋ {t('add_contact')}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('loading')}</Text>
          </View>
        ) : contacts.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('ContactForm', { contact: undefined })}
            activeOpacity={0.7}
          >
            <Text style={styles.emptyEmoji}>👨‍⚕️</Text>
            <Text style={styles.emptyTitle}>{t('contacts_empty')}</Text>
            <Text style={styles.emptyHint}>{t('contacts_empty_sub')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.contactsCard}>
            {contacts.map((c, idx) => (
              <ContactRow
                key={c.id}
                contact={c}
                isLast={idx === contacts.length - 1}
                onEdit={() => navigation.navigate('ContactForm', { contact: c })}
                onDelete={() => confirmDelete(c)}
                t={t}
              />
            ))}
          </View>
        )}

        {/* ── Documents section ── */}
        <View style={[styles.sectionRow, { marginTop: Spacing.lg }]}>
          <Text style={styles.sectionTitle}>Documents</Text>
        </View>

        <View style={styles.docsCard}>
          <Text style={styles.docsEmoji}>📂</Text>
          <Text style={styles.docsTitle}>Coming soon</Text>
          <Text style={styles.docsSub}>
            Upload and store medical documents, scan results, prescriptions and referrals — all in one secure place.
          </Text>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  contact,
  isLast,
  onEdit,
  onDelete,
  t,
}: {
  contact: Contact;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: any, vars?: any) => string;
}) {
  const icon = ROLE_ICONS[contact.role] ?? '👤';
  const color = ROLE_COLORS[contact.role] ?? '#9E9E9E';

  return (
    <View style={[styles.contactRow, !isLast && styles.contactRowBorder]}>
      {/* Avatar */}
      <View style={[styles.contactAvatar, { backgroundColor: color + '20' }]}>
        <Text style={styles.contactAvatarEmoji}>{icon}</Text>
      </View>

      {/* Info */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={[styles.contactRole, { color }]}>{t(`role_${contact.role}` as any)}</Text>
        {contact.hospital ? (
          <Text style={styles.contactSub} numberOfLines={1}>
            {contact.hospital}{contact.department ? ` · ${contact.department}` : ''}
          </Text>
        ) : null}

        {/* Quick action row */}
        {(contact.phone || contact.email) ? (
          <View style={styles.contactActions}>
            {contact.phone ? (
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              >
                <Text style={styles.actionChipText}>📞 {contact.phone}</Text>
              </TouchableOpacity>
            ) : null}
            {contact.email ? (
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => Linking.openURL(`mailto:${contact.email}`)}
              >
                <Text style={styles.actionChipText}>✉️ {contact.email}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {contact.notes ? (
          <Text style={styles.contactNotes} numberOfLines={1}>📝 {contact.notes}</Text>
        ) : null}
      </View>

      {/* Edit / Delete */}
      <View style={styles.contactButtons}>
        <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },

  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
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

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },

  // Empty state
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
  emptyHint: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },

  // Contacts card
  contactsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  contactRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  contactAvatarEmoji: { fontSize: 22 },
  contactInfo: { flex: 1, gap: 2 },
  contactName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  contactRole: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  contactSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  contactActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.xs,
  },
  actionChip: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  actionChipText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  contactNotes: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
  iconBtn: { padding: 6 },
  iconBtnText: { fontSize: 16 },

  // Documents
  docsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docsEmoji: { fontSize: 44, opacity: 0.5 },
  docsTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
  },
  docsSub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
