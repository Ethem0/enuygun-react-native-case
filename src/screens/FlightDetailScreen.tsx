import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteButton } from '../components/FavoriteButton';
import type { RootStackParamList } from '../navigation/navigation.types';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useFlightListStore } from '../stores/flightListStore';
import { formatBaggage } from '../utils/formatBaggage';
import { formatFlightDate, formatFlightTime } from '../utils/formatDate';
import { formatDuration } from '../utils/formatDuration';
import { formatPrice } from '../utils/formatPrice';

type FlightDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'FlightDetail'
>;

export function FlightDetailScreen({ route }: FlightDetailScreenProps) {
  const listFlight = useFlightListStore((state) =>
    state.items.find((item) => item.id === route.params.flightId),
  );
  const favoriteFlight = useFavoritesStore(
    (state) => state.flightsById[route.params.flightId],
  );
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(route.params.flightId),
  );
  const hydrated = useFavoritesStore((state) => state.hydrated);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const flight = listFlight ?? favoriteFlight;

  if (flight === undefined) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.centeredState}>
          <Text accessibilityRole="header" style={styles.missingTitle}>
            Uçuş bulunamadı
          </Text>
          <Text style={styles.missingText}>
            Bu uçuşun bilgileri yüklenen listede bulunmuyor.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stopsLabel = flight.stops === 0 ? 'Direkt' : '1 aktarma';

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text accessibilityRole="header" style={styles.airline}>
              {flight.airline}
            </Text>
            <Text style={styles.flightNumber}>{flight.flightNumber}</Text>
          </View>
          <FavoriteButton
            disabled={!hydrated}
            isFavorite={isFavorite}
            onPress={() => void toggleFavorite(flight.id)}
          />
        </View>

        <View style={styles.routeCard}>
          <View style={styles.airportColumn}>
            <Text style={styles.airportCode}>{flight.origin.code}</Text>
            <Text style={styles.airportName}>{flight.origin.name}</Text>
            <Text style={styles.date}>{formatFlightDate(flight.departureAt)}</Text>
            <Text style={styles.time}>{formatFlightTime(flight.departureAt)}</Text>
          </View>

          <Text style={styles.routeArrow}>→</Text>

          <View style={[styles.airportColumn, styles.destination]}>
            <Text style={styles.airportCode}>{flight.destination.code}</Text>
            <Text style={styles.airportName}>{flight.destination.name}</Text>
            <Text style={styles.date}>{formatFlightDate(flight.arrivalAt)}</Text>
            <Text style={styles.time}>{formatFlightTime(flight.arrivalAt)}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow label="Toplam süre" value={formatDuration(flight.durationMinutes)} />
          <InfoRow label="Uçuş tipi" value={stopsLabel} />
          <InfoRow label="Bagaj" value={formatBaggage(flight.baggageKg)} />
          <InfoRow label="Fiyat" value={formatPrice(flight.priceMinor)} isLast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function InfoRow({ label, value, isLast = false }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  airline: {
    color: '#151b26',
    fontSize: 24,
    fontWeight: '700',
  },
  flightNumber: {
    marginTop: 4,
    color: '#586174',
    fontSize: 15,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#d9dde3',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  airportColumn: {
    flex: 1,
  },
  destination: {
    alignItems: 'flex-end',
  },
  routeArrow: {
    marginHorizontal: 12,
    color: '#687386',
    fontSize: 22,
  },
  airportCode: {
    color: '#151b26',
    fontSize: 26,
    fontWeight: '700',
  },
  airportName: {
    minHeight: 38,
    marginTop: 4,
    color: '#586174',
    fontSize: 13,
  },
  date: {
    marginTop: 14,
    color: '#3e4859',
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    marginTop: 3,
    color: '#151b26',
    fontSize: 20,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d9dde3',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eceef2',
    paddingVertical: 15,
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: '#586174',
    fontSize: 14,
  },
  infoValue: {
    flexShrink: 1,
    color: '#151b26',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingTitle: {
    color: '#151b26',
    fontSize: 20,
    fontWeight: '700',
  },
  missingText: {
    marginTop: 8,
    color: '#586174',
    fontSize: 15,
    textAlign: 'center',
  },
});
