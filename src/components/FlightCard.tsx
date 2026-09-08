import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { FlightDto } from '../types/flight.types';
import { formatDuration } from '../utils/formatDuration';
import { formatFlightTime } from '../utils/formatDate';
import { formatPrice } from '../utils/formatPrice';
import { FavoriteButton } from './FavoriteButton';

type FlightCardProps = {
  flight: FlightDto;
  onPress: () => void;
};

export function FlightCard({ flight, onPress }: FlightCardProps) {
  const stopsLabel = flight.stops === 0 ? 'Direkt' : '1 aktarma';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityHint="Uçuş detayını açar"
          accessibilityLabel={`${flight.airline} ${flight.flightNumber}, ${flight.origin.code} kalkışlı ${flight.destination.code} varışlı uçuş`}
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.mainAction, pressed && styles.pressed]}
        >
          <Text style={styles.airline}>{flight.airline}</Text>
          <Text style={styles.flightNumber}>{flight.flightNumber}</Text>

          <View style={styles.routeRow}>
            <View>
              <Text style={styles.airportCode}>{flight.origin.code}</Text>
              <Text style={styles.time}>{formatFlightTime(flight.departureAt)}</Text>
            </View>
            <Text style={styles.routeArrow}>→</Text>
            <View style={styles.destination}>
              <Text style={styles.airportCode}>{flight.destination.code}</Text>
              <Text style={styles.time}>{formatFlightTime(flight.arrivalAt)}</Text>
            </View>
          </View>

          <Text style={styles.secondaryText}>
            {formatDuration(flight.durationMinutes)} · {stopsLabel}
          </Text>
          <Text style={styles.price}>{formatPrice(flight.priceMinor)}</Text>
        </Pressable>

        <FavoriteButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d9dde3',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  mainAction: {
    flex: 1,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.65,
  },
  airline: {
    color: '#151b26',
    fontSize: 17,
    fontWeight: '700',
  },
  flightNumber: {
    marginTop: 2,
    color: '#586174',
    fontSize: 13,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  destination: {
    alignItems: 'flex-end',
  },
  routeArrow: {
    flex: 1,
    marginHorizontal: 12,
    color: '#687386',
    fontSize: 20,
    textAlign: 'center',
  },
  airportCode: {
    color: '#151b26',
    fontSize: 20,
    fontWeight: '700',
  },
  time: {
    marginTop: 2,
    color: '#3e4859',
    fontSize: 15,
  },
  secondaryText: {
    marginTop: 14,
    color: '#586174',
    fontSize: 14,
  },
  price: {
    marginTop: 8,
    color: '#151b26',
    fontSize: 19,
    fontWeight: '700',
  },
});
