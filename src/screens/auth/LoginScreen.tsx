import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/spacing';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch((err) => {
        Alert.alert('Sign-in failed', err.message ?? 'Could not sign in. Try again.');
      });
    } else if (response?.type === 'error') {
      Alert.alert('Sign-in failed', 'Google sign-in was cancelled or failed.');
    }
  }, [response]);

  const loading = !request;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🏥</Text>
        <Text style={styles.title}>FamilyCare Sync</Text>
        <Text style={styles.subtitle}>Private family medical coordination</Text>

        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.btnDisabled]}
          onPress={() => promptAsync()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textPrimary} />
          ) : (
            <View style={styles.googleBtnInner}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>Access is restricted to authorized family members only.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl },
  logo: { fontSize: 56, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  googleBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.5 },
  googleBtnInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  googleIcon: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: '#4285F4',
  },
  googleBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  footerNote: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xxl },
});
