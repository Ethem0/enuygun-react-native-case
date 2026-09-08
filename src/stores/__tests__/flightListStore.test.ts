import { beforeEach, expect, it, jest } from '@jest/globals';

import { ApiError } from '../../api/client';
import { getFlights } from '../../api/flightsApi';
import type {
  FlightDto,
  FlightListResponse,
  FlightSort,
} from '../../types/flight.types';
import { useFlightListStore } from '../flightListStore';

jest.mock('../../api/flightsApi', () => ({
  getFlights: jest.fn(),
}));

const mockedGetFlights = jest.mocked(getFlights);
const initialStoreState = useFlightListStore.getInitialState();

function createFlight(id: string): FlightDto {
  return {
    id,
    flightNumber: `TEST-${id}`,
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
}

function createResponse(
  items: FlightDto[],
  page: number,
  hasMore: boolean,
  sort: FlightSort = 'price',
  onlyDirect = false,
): FlightListResponse {
  return {
    items,
    meta: {
      page,
      limit: 8,
      total: hasMore ? 16 : items.length,
      totalPages: hasMore ? 2 : 1,
      hasMore,
      sort,
      onlyDirect,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  useFlightListStore.setState(initialStoreState, true);
});

it('resets pagination and replaces old items when the direct filter changes', async () => {
  const firstPageFlight = createFlight('FL001');
  const secondPageFlight = createFlight('FL009');
  const directFlight = createFlight('FL017');

  mockedGetFlights
    .mockResolvedValueOnce(createResponse([firstPageFlight], 1, true))
    .mockResolvedValueOnce(createResponse([secondPageFlight], 2, false))
    .mockResolvedValueOnce(
      createResponse([directFlight], 1, false, 'price', true),
    );

  await useFlightListStore.getState().fetchInitial();
  await useFlightListStore.getState().fetchNextPage();

  expect(useFlightListStore.getState().items).toEqual([
    firstPageFlight,
    secondPageFlight,
  ]);

  await useFlightListStore.getState().changeOnlyDirect(true);

  expect(mockedGetFlights).toHaveBeenLastCalledWith({
    page: 1,
    limit: 8,
    sort: 'price',
    onlyDirect: true,
  });
  expect(useFlightListStore.getState().items).toEqual([directFlight]);
  expect(useFlightListStore.getState().meta?.page).toBe(1);
  expect(useFlightListStore.getState().generation).toBe(1);
  expect([...useFlightListStore.getState().loadedPages]).toEqual([1]);
});

it('coalesces repeated next-page triggers into one request', async () => {
  const firstPageFlight = createFlight('FL001');
  const secondPageFlight = createFlight('FL009');
  let resolveSecondPage!: (response: FlightListResponse) => void;
  const secondPageResponse = new Promise<FlightListResponse>((resolve) => {
    resolveSecondPage = resolve;
  });

  mockedGetFlights
    .mockResolvedValueOnce(createResponse([firstPageFlight], 1, true))
    .mockReturnValueOnce(secondPageResponse);

  await useFlightListStore.getState().fetchInitial();

  const firstTrigger = useFlightListStore.getState().fetchNextPage();
  const repeatedTrigger = useFlightListStore.getState().fetchNextPage();

  expect(mockedGetFlights).toHaveBeenCalledTimes(2);
  expect(mockedGetFlights).toHaveBeenLastCalledWith({
    page: 2,
    limit: 8,
    sort: 'price',
    onlyDirect: false,
  });

  resolveSecondPage(createResponse([secondPageFlight], 2, false));
  await Promise.all([firstTrigger, repeatedTrigger]);

  expect(useFlightListStore.getState().items).toEqual([
    firstPageFlight,
    secondPageFlight,
  ]);
});

it('ignores a response from an older query generation', async () => {
  const staleFlight = createFlight('FL001');
  const currentFlight = createFlight('FL003');
  let resolveStaleRequest!: (response: FlightListResponse) => void;
  const staleResponse = new Promise<FlightListResponse>((resolve) => {
    resolveStaleRequest = resolve;
  });

  mockedGetFlights
    .mockReturnValueOnce(staleResponse)
    .mockResolvedValueOnce(
      createResponse([currentFlight], 1, false, 'duration'),
    );

  const staleRequest = useFlightListStore.getState().fetchInitial();
  await useFlightListStore.getState().changeSort('duration');

  resolveStaleRequest(createResponse([staleFlight], 1, false));
  await staleRequest;

  expect(useFlightListStore.getState().items).toEqual([currentFlight]);
  expect(useFlightListStore.getState().meta?.sort).toBe('duration');
  expect(useFlightListStore.getState().generation).toBe(1);
});

it('preserves loaded items and retries the failed pagination page', async () => {
  const firstPageFlight = createFlight('FL001');
  const secondPageFlight = createFlight('FL009');

  mockedGetFlights
    .mockResolvedValueOnce(createResponse([firstPageFlight], 1, true))
    .mockRejectedValueOnce(
      new ApiError('Uçuşlar yüklenemedi. Lütfen tekrar deneyin.', 500),
    )
    .mockResolvedValueOnce(createResponse([secondPageFlight], 2, false));

  await useFlightListStore.getState().fetchInitial();
  await useFlightListStore.getState().fetchNextPage();

  expect(useFlightListStore.getState().items).toEqual([firstPageFlight]);
  expect(useFlightListStore.getState().failedPaginationPage).toBe(2);
  expect(useFlightListStore.getState().paginationError).toBe(
    'Uçuşlar yüklenemedi. Lütfen tekrar deneyin.',
  );

  await useFlightListStore.getState().retryPagination();

  expect(mockedGetFlights).toHaveBeenLastCalledWith({
    page: 2,
    limit: 8,
    sort: 'price',
    onlyDirect: false,
  });
  expect(useFlightListStore.getState().items).toEqual([
    firstPageFlight,
    secondPageFlight,
  ]);
  expect(useFlightListStore.getState().paginationError).toBeNull();
});
