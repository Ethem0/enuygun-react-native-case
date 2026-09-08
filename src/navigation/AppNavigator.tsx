import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FlightDetailScreen } from '../screens/FlightDetailScreen';
import { FlightsScreen } from '../screens/FlightsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import type { RootStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Flights">
        <Stack.Screen
          component={FlightsScreen}
          name="Flights"
          options={({ navigation }) => ({
            title: 'Uçuşlar',
            headerRight: () => (
              <Pressable
                accessibilityLabel="Favori uçuşları aç"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.navigate('Favorites')}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.headerButtonText}>Favoriler</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          component={FavoritesScreen}
          name="Favorites"
          options={{ title: 'Favoriler' }}
        />
        <Stack.Screen
          component={FlightDetailScreen}
          name="FlightDetail"
          options={{ title: 'Uçuş Detayı' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButtonText: {
    color: '#2457a7',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
