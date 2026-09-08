import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FlightDetailScreen } from '../screens/FlightDetailScreen';
import { FlightsScreen } from '../screens/FlightsScreen';
import type { RootStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Flights">
        <Stack.Screen
          component={FlightsScreen}
          name="Flights"
          options={{ title: 'Uçuşlar' }}
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
