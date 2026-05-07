import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { EMAIL_WHITELIST } from '../../constants/emailWhitelist';
import { storePendingEmail } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

const ACTION_CODE_SETTINGS = {
  url: 'https://familycare-sync.firebaseapp.com/finishSignIn',
  handleCodeInApp: true,
  iOS: { bundleId: 'com.familycare.sync' },
  android: { packageName: 'com.familycare.sync', installIfNotInstalled: true },
};

type Screen = 'enterEmail' | 'linkSent';

export function LoginScreen() {
  const [screen, setScreen] = useState<Screen>('enterEmail');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendLink() {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      Alert.alert('Enter your email', 'Please enter your family email address.');
      return;
    }

    if (!EMAIL_WHITELIST.includes(trimmed)) {
      Alert.alert(
        'Not authorized',
        'This email is not part of the family group. Contact the app administrator.'
      );
      return;
    }

    setLoading(true);
    try {
      storePendingEmail(trimmed);
      await sendSignInLinkToEmail(auth, trimmed, ACTION_CODE_SETTINGS);
      setScreen('linkSent');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not send sign-in link. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.title}>FamilyCare Sync</Text>
        <Text style={styles.subtitle}>Private family medical coordination</Text>

        {screen === 'enterEmail' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Family email address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              autoFocus
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendLink}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={Colors.textOnPrimary} />
                : <Text style={styles.buttonText}>Send Sign-In Link →</Text>
              }
            </TouchableOpacity>

            <Text style={styles.hint}>
              We'll send a magic link to your email.{'\n'}Tap it to sign in instantly — no password needed.
            </Text>
          </View>
        ) : (
          <View style={styles.sentBox}>
            <Text style={styles.sentEmoji}>📬</Text>
            <Text style={styles.sentTitle}>Check your email</Text>
            <Text style={styles.sentBody}>
              A sign-in link was sent to{'\n'}
              <Text style={styles.sentEmail}>{email}</Text>
            </Text>
            <Text style={styles.sentHint}>
              Open the email and tap the link to sign in. You can close this screen.
            </Text>
            <TouchableOpacity onPress={() => setScreen('enterEmail')} style={styles.retryBtn}>
              <Text style={styles.retryText}>← Use a different email</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footerNote}>Access is restricted to authorized family members only.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  form: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  hint: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md, lineHeight: 20 },
  sentBox: { alignItems: 'center', gap: Spacing.md },
  sentEmoji: { fontSize: 64 },
  sentTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  sentBody: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  sentEmail: { fontWeight: FontWeight.bold, color: Colors.primary },
  sentHint: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn: { marginTop: Spacing.sm },
  retryText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.medium },
  footerNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
});
