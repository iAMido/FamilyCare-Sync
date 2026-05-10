import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { FamilyProvider } from './src/contexts/FamilyContext';

interface ErrorState { error: Error | null }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorState> {
  state: ErrorState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <ScrollView contentContainerStyle={eb.container}>
          <Text style={eb.title}>Something went wrong</Text>
          <Text style={eb.msg}>{this.state.error.message}</Text>
          <Text style={eb.stack}>{this.state.error.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 12 },
  msg: { fontSize: 14, color: '#333', marginBottom: 12 },
  stack: { fontSize: 11, color: '#999', fontFamily: 'monospace' },
});

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <FamilyProvider>
          <GestureHandlerRootView style={styles.root}>
            <RootNavigator />
          </GestureHandlerRootView>
        </FamilyProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
