import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { ApiError } from '../api/client';
import { getFlightsByIds } from '../api/flightsApi';
import type { FlightDto } from '../types/flight.types';

export const FAVORITES_STORAGE_KEY = 'flight-discovery.favoriteIds.v1';

const FAVORITES_ERROR_MESSAGE =
  'Favori uçuşlar yüklenemedi. Lütfen tekrar deneyin.';

type FavoritesState = {
  favoriteIds: string[];
  hydrated: boolean;
  persistenceAvailable: boolean;
  flightsById: Record<string, FlightDto>;
  isFlightsLoading: boolean;
  flightsError: string | null;
  hydrateFavorites: () => Promise<void>;
  toggleFavorite: (flightId: string) => Promise<void>;
  removeFavorite: (flightId: string) => Promise<void>;
  isFavorite: (flightId: string) => boolean;
  loadFavoriteFlights: () => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;
let persistenceQueue: Promise<void> = Promise.resolve();
let flightsRequestVersion = 0;

function parseFavoriteIds(storedValue: string | null): string[] {
  if (storedValue === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const validIds = parsed.filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );

    return [...new Set(validIds)];
  } catch {
    return [];
  }
}

function persistFavoriteIds(favoriteIds: string[]): Promise<void> {
  persistenceQueue = persistenceQueue
    .catch(() => undefined)
    .then(() =>
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds)),
    )
    .catch(() => undefined);

  return persistenceQueue;
}

function getFlightsErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : FAVORITES_ERROR_MESSAGE;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],
  hydrated: false,
  persistenceAvailable: false,
  flightsById: {},
  isFlightsLoading: false,
  flightsError: null,

  hydrateFavorites: () => {
    if (get().hydrated) {
      return Promise.resolve();
    }

    if (hydrationPromise !== null) {
      return hydrationPromise;
    }

    hydrationPromise = (async () => {
      try {
        const storedValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

        set({
          favoriteIds: parseFavoriteIds(storedValue),
          hydrated: true,
          persistenceAvailable: true,
        });
      } catch {
        set({
          favoriteIds: [],
          hydrated: true,
          persistenceAvailable: false,
        });
      } finally {
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
  },

  toggleFavorite: async (flightId) => {
    const current = get();

    if (!current.hydrated) {
      return;
    }

    const favoriteIds = current.favoriteIds.includes(flightId)
      ? current.favoriteIds.filter((id) => id !== flightId)
      : [...current.favoriteIds, flightId];

    set({ favoriteIds });

    if (current.persistenceAvailable) {
      await persistFavoriteIds(favoriteIds);
    }
  },

  removeFavorite: async (flightId) => {
    const current = get();

    if (!current.hydrated || !current.favoriteIds.includes(flightId)) {
      return;
    }

    const favoriteIds = current.favoriteIds.filter((id) => id !== flightId);
    set({ favoriteIds });

    if (current.persistenceAvailable) {
      await persistFavoriteIds(favoriteIds);
    }
  },

  isFavorite: (flightId) => get().favoriteIds.includes(flightId),

  loadFavoriteFlights: async () => {
    const favoriteIds = get().favoriteIds;
    const requestVersion = ++flightsRequestVersion;

    if (favoriteIds.length === 0) {
      set({ isFlightsLoading: false, flightsError: null });
      return;
    }

    set({ isFlightsLoading: true, flightsError: null });

    try {
      const response = await getFlightsByIds(favoriteIds);

      if (requestVersion !== flightsRequestVersion) {
        return;
      }

      const flightsById = { ...get().flightsById };

      for (const flight of response.items) {
        flightsById[flight.id] = flight;
      }

      set({
        flightsById,
        isFlightsLoading: false,
        flightsError: null,
      });
    } catch (error) {
      if (requestVersion !== flightsRequestVersion) {
        return;
      }

      set({
        isFlightsLoading: false,
        flightsError: getFlightsErrorMessage(error),
      });
    }
  },
}));
