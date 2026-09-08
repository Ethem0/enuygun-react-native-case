import { useEffect } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlightCard } from '../components/FlightCard';
import type { RootStackParamList } from '../navigation/navigation.types';
import { useFavoritesStore } from '../stores/favoritesStore';
import type { FlightDto } from '../types/flight.types';

type FavoritesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Favorites'
>;

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const flightsById = useFavoritesStore((state) => state.flightsById);
  const isLoading = useFavoritesStore((state) => state.isFlightsLoading);
  const error = useFavoritesStore((state) => state.flightsError);
  const loadFavoriteFlights = useFavoritesStore(
    (state) => state.loadFavoriteFlights,
  );
  const favoriteIdsKey = favoriteIds.join(',');
  const flights = favoriteIds.reduce<FlightDto[]>((result, flightId) => {
    const flight = flightsById[flightId];

    if (flight !== undefined) {
      result.push(flight);
    }

    return result;
  }, []);

  useEffect(() => {
    void loadFavoriteFlights();
  }, [favoriteIdsKey, loadFavoriteFlights]);

  if (favoriteIds.length === 0) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text accessibilityRole="header" style={styles.stateTitle}>
            Henüz favori uçuş yok
          </Text>
          <Text style={styles.stateText}>
            Beğendiğiniz uçuşları favori düğmesiyle buraya ekleyebilirsiniz.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && flights.length === 0) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <ActivityIndicator accessibilityLabel="Favori uçuşlar yükleniyor" size="large" />
          <Text style={styles.stateText}>Favori uçuşlar yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error !== null && flights.length === 0) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <ErrorMessage error={error} onRetry={() => void loadFavoriteFlights()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={flights}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.inlineState}>
              <ActivityIndicator accessibilityLabel="Favori uçuşlar güncelleniyor" />
            </View>
          ) : null
        }
        ListHeaderComponent={
          error !== null ? (
            <ErrorMessage error={error} onRetry={() => void loadFavoriteFlights()} />
          ) : null
        }
        renderItem={({ item }) => (
          <FlightCard
            flight={item}
            onPress={() =>
              navigation.navigate('FlightDetail', { flightId: item.id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

type ErrorMessageProps = {
  error: string;
  onRetry: () => void;
};

function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.centeredState}>
      <Text accessibilityRole="header" style={styles.stateTitle}>
        Favoriler yüklenemedi
      </Text>
      <Text style={styles.stateText}>{error}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        <Text style={styles.retryButtonText}>Tekrar dene</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  inlineState: {
    alignItems: 'center',
    padding: 16,
  },
  stateTitle: {
    color: '#151b26',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    color: '#586174',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#2457a7',
    paddingHorizontal: 18,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
