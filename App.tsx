import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useFavoritesStore } from './src/stores/favoritesStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const hydrated = useFavoritesStore((state) => state.hydrated);
  const hydrateFavorites = useFavoritesStore(
    (state) => state.hydrateFavorites,
  );

  useEffect(() => {
    void hydrateFavorites();
  }, [hydrateFavorites]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator accessibilityLabel="Favoriler hazırlanıyor" size="large" />
          <Text style={styles.loadingText}>Uygulama hazırlanıyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loadingSafeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#586174',
    fontSize: 15,
  },
});
