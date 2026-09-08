import type { ComponentProps } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { beforeEach, expect, it, jest } from '@jest/globals';

import { ApiError } from '../../api/client';
import { getFlights } from '../../api/flightsApi';
import { useFlightListStore } from '../../stores/flightListStore';
import type { FlightDto, FlightListResponse } from '../../types/flight.types';
import { FlightsScreen } from '../FlightsScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

jest.mock('../../api/flightsApi', () => ({
  getFlights: jest.fn(),
  getFlightsByIds: jest.fn(),
}));

const mockedGetFlights = jest.mocked(getFlights);
const initialStoreState = useFlightListStore.getInitialState();

const flight: FlightDto = {
  id: 'FL001',
  flightNumber: 'TEST-001',
  airline: 'Test Hava Yolları',
  origin: {
    code: 'IST',
    city: 'İstanbul',
    name: 'İstanbul Havalimanı',
  },
  destination: {
    code: 'AYT',
    city: 'Antalya',
    name: 'Antalya Havalimanı',
  },
  departureAt: '2026-10-15T08:00:00+03:00',
  arrivalAt: '2026-10-15T09:10:00+03:00',
  durationMinutes: 70,
  stops: 0,
  priceMinor: 150000,
  currency: 'TRY',
  baggageKg: 20,
};

const successfulResponse: FlightListResponse = {
  items: [flight],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
    hasMore: false,
    sort: 'price',
    onlyDirect: false,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  useFlightListStore.setState(initialStoreState, true);
});

it('shows a successful flight list after the user retries an initial failure', async () => {
  mockedGetFlights
    .mockRejectedValueOnce(
      new ApiError('Uçuşlar yüklenemedi. Lütfen tekrar deneyin.', 500),
    )
    .mockResolvedValueOnce(successfulResponse);

  const props = {
    navigation: { navigate: jest.fn() },
    route: { key: 'Flights-test', name: 'Flights' },
  } as unknown as ComponentProps<typeof FlightsScreen>;

  const view = await render(<FlightsScreen {...props} />);

  expect(await view.findByText('Uçuşlar yüklenemedi')).toBeOnTheScreen();
  expect(
    view.getByText('Uçuşlar yüklenemedi. Lütfen tekrar deneyin.'),
  ).toBeOnTheScreen();

  await fireEvent.press(view.getByRole('button', { name: 'Tekrar dene' }));

  await waitFor(() => {
    expect(view.getByText('Test Hava Yolları')).toBeOnTheScreen();
  });

  expect(view.getByText('TEST-001')).toBeOnTheScreen();
  expect(view.getByText('1 uçuş bulundu')).toBeOnTheScreen();
  expect(mockedGetFlights).toHaveBeenCalledTimes(2);
  expect(mockedGetFlights).toHaveBeenLastCalledWith({
    page: 1,
    limit: 8,
    sort: 'price',
    onlyDirect: false,
  });
});
