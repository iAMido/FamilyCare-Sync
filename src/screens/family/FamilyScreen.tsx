import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../contexts/FamilyContext';
import { showConfirm } from '../../utils/alert';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';
import { EMAIL_WHITELIST } from '../../constants/emailWhitelist';
import { SettingsStackParamList } from '../../navigation/AppTabs';
import { useLanguage } from '../../contexts/LanguageContext';

type Nav = StackNavigationProp<SettingsStackParamList, 'SettingsHome'>;

const AVATAR_COLORS = ['#6B9E7A', '#7B9ED9', '#C97BBD', '#E8734A', '#5BB5C3', '#F5A623'];

export function FamilyScreen() {
  const navigation = useNavigation<Nav>();
  const { state, logout } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  const user = state.status === 'authenticated' ? state.user : null;
  const { members } = useFamily();

  function confirmLogout() {
    const ok = showConfirm(t('sign_out_confirm'), t('sign_out_confirm_msg'));
    if (ok) logout();
  }

  const initials = (name: string) =>
    name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings ⚙️</Text>
          <Text style={styles.headerSub}>App settings & family</Text>
        </View>

        {/* Current user card */}
        {user && (
          <View style={styles.meCard}>
            <View style={[styles.meAvatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.meAvatarText}>{initials(user.displayName ?? user.email)}</Text>
            </View>
            <View style={styles.meInfo}>
              <Text style={styles.meName}>{user.displayName}</Text>
              <Text style={styles.meEmail}>{user.email}</Text>
            </View>
            <View style={styles.meBadge}>
              <Text style={styles.meBadgeText}>You</Text>
            </View>
          </View>
        )}

        {/* Family members */}
        <Text style={styles.sectionTitle}>{t('members', { count: members.length })}</Text>

        <View style={styles.membersCard}>
          {members.length === 0 ? (
            <Text style={styles.emptyText}>Loading members…</Text>
          ) : (
            members.map((m, idx) => (
              <View key={m.uid} style={[styles.memberRow, idx < members.length - 1 && styles.memberRowBorder]}>
                <View style={[styles.memberAvatar, { backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }]}>
                  <Text style={styles.memberAvatarText}>{initials(m.displayName ?? m.email)}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.displayName}</Text>
                  <Text style={styles.memberEmail}>{m.email}</Text>
                </View>
                {m.uid === user?.uid && (
                  <View style={styles.youChip}>
                    <Text style={styles.youChipText}>You</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Authorized emails section */}
        <Text style={styles.sectionTitle}>{t('authorized_emails')}</Text>
        <View style={styles.whitelistCard}>
          <Text style={styles.whitelistNote}>{t('authorized_emails_note')}</Text>
          {EMAIL_WHITELIST.map((email) => (
            <View key={email} style={styles.emailRow}>
              <View style={styles.emailDot} />
              <Text style={styles.emailText}>{email}</Text>
            </View>
          ))}
        </View>

        {/* App info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>FamilyCare Sync</Text>
          <Text style={styles.infoText}>
            A private family app for coordinating medical appointments, escorts, and care.
          </Text>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>{t('settings')}</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => navigation.navigate('PresetManagement')}
          >
            <Text style={styles.settingsIcon}>🗂️</Text>
            <View style={styles.settingsInfo}>
              <Text style={styles.settingsLabel}>{t('appointment_types')}</Text>
              <Text style={styles.settingsSub}>{t('appointment_types_sub')}</Text>
            </View>
            <Text style={styles.settingsChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingsDivider} />

          {/* Language toggle */}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsIcon}>🌐</Text>
            <View style={styles.settingsInfo}>
              <Text style={styles.settingsLabel}>{t('language_label')}</Text>
            </View>
            <View style={styles.langToggle}>
              <TouchableOpacity
                style={[styles.langBtn, locale === 'en' && styles.langBtnActive]}
                onPress={() => setLocale('en')}
              >
                <Text style={[styles.langBtnText, locale === 'en' && styles.langBtnTextActive]}>EN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtn, locale === 'he' && styles.langBtnActive]}
                onPress={() => setLocale('he')}
              >
                <Text style={[styles.langBtnText, locale === 'he' && styles.langBtnTextActive]}>עב</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={confirmLogout}>
          <Text style={styles.signOutText}>{t('sign_out')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
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
  // Me card
  meCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  meAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  meAvatarText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  meInfo: {
    flex: 1,
  },
  meName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  meEmail: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  meBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  meBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  // Section
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  // Members card
  membersCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textOnPrimary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  memberEmail: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  youChip: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  youChipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  emptyText: {
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  // Whitelist
  whitelistCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  whitelistNote: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  emailText: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  // Info card
  infoCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  infoTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  infoText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Settings
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.md,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  settingsIcon: { fontSize: 22 },
  settingsInfo: { flex: 1 },
  settingsLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  settingsSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 1 },
  settingsChevron: { fontSize: FontSize.xl, color: Colors.textMuted },
  langToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  langBtnActive: {
    backgroundColor: Colors.primary,
  },
  langBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  langBtnTextActive: {
    color: Colors.textOnPrimary,
  },
  // Sign out
  signOutBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});
