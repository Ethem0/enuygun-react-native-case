import { beforeEach, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FAVORITES_STORAGE_KEY,
  useFavoritesStore,
} from '../favoritesStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockedGetItem = jest.mocked(AsyncStorage.getItem);
const mockedSetItem = jest.mocked(AsyncStorage.setItem);
const initialStoreState = useFavoritesStore.getInitialState();

beforeEach(() => {
  jest.clearAllMocks();
  useFavoritesStore.setState(initialStoreState, true);
});

it('hydrates, persists mutations, and restores favorites without a pre-hydration write', async () => {
  let storedValue: string | null = JSON.stringify(['FL001', 'FL001']);
  let resolveHydration!: (value: string | null) => void;

  mockedGetItem.mockImplementationOnce(
    () =>
      new Promise<string | null>((resolve) => {
        resolveHydration = resolve;
      }),
  );
  mockedSetItem.mockImplementation(async (_key, value) => {
    storedValue = value;
  });

  const hydration = useFavoritesStore.getState().hydrateFavorites();

  expect(useFavoritesStore.getState().hydrated).toBe(false);
  expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
  expect(mockedSetItem).not.toHaveBeenCalled();

  resolveHydration(storedValue);
  await hydration;

  expect(useFavoritesStore.getState().favoriteIds).toEqual(['FL001']);
  expect(useFavoritesStore.getState().hydrated).toBe(true);
  expect(mockedSetItem).not.toHaveBeenCalled();

  await useFavoritesStore.getState().toggleFavorite('FL002');

  expect(useFavoritesStore.getState().favoriteIds).toEqual(['FL001', 'FL002']);
  expect(mockedSetItem).toHaveBeenLastCalledWith(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(['FL001', 'FL002']),
  );

  useFavoritesStore.setState(initialStoreState, true);
  mockedGetItem.mockResolvedValueOnce(storedValue);

  expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
  expect(useFavoritesStore.getState().hydrated).toBe(false);
  expect(mockedSetItem).toHaveBeenCalledTimes(1);

  await useFavoritesStore.getState().hydrateFavorites();

  expect(useFavoritesStore.getState().favoriteIds).toEqual(['FL001', 'FL002']);
  expect(useFavoritesStore.getState().hydrated).toBe(true);
  expect(mockedSetItem).toHaveBeenCalledTimes(1);

  await useFavoritesStore.getState().removeFavorite('FL001');

  expect(useFavoritesStore.getState().favoriteIds).toEqual(['FL002']);
  expect(mockedSetItem).toHaveBeenLastCalledWith(
    FAVORITES_STORAGE_KEY,
    JSON.stringify(['FL002']),
  );
});
