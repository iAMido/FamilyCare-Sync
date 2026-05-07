import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { EMAIL_WHITELIST } from '../../constants/emailWhitelist';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

type Mode = 'login' | 'register';

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedEmail = email.trim().toLowerCase();

  function checkWhitelist(): boolean {
    if (!EMAIL_WHITELIST.includes(trimmedEmail)) {
      Alert.alert('Not authorized', 'This email is not part of the family group.');
      return false;
    }
    return true;
  }

  async function handleLogin() {
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (!checkWhitelist()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err: any) {
      Alert.alert('Sign-in failed', friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and a password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (!checkWhitelist()) return;
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err: any) {
      Alert.alert('Registration failed', friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!trimmedEmail) {
      Alert.alert('Enter your email first', 'Type your email above, then tap Forgot Password.');
      return;
    }
    if (!checkWhitelist()) return;
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      Alert.alert('Email sent', `Password reset link sent to ${trimmedEmail}`);
    } catch {
      Alert.alert('Error', 'Could not send reset email. Try again.');
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

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Family email address"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.textOnPrimary} />
              : <Text style={styles.buttonText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>

          {mode === 'login' && (
            <TouchableOpacity onPress={handleForgotPassword} style={styles.linkBtn}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={styles.linkBtn}>
            <Text style={styles.linkText}>
              {mode === 'login' ? "First time? Create account →" : "← Back to sign in"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>Access is restricted to authorized family members only.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/user-not-found': return 'No account found. Use "Create Account" to register.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
    default: return 'Something went wrong. Try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  form: { gap: Spacing.sm },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: Spacing.xs,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.textOnPrimary, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  linkBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  linkText: { fontSize: FontSize.sm, color: Colors.primary },
  footerNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
});
