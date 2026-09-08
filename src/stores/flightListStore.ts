import { create } from 'zustand';

import { ApiError } from '../api/client';
import { getFlights } from '../api/flightsApi';
import type {
  FlightDto,
  FlightListMeta,
  FlightSort,
} from '../types/flight.types';

const PAGE_LIMIT = 8;
const DEFAULT_ERROR_MESSAGE = 'Uçuşlar yüklenemedi. Lütfen tekrar deneyin.';

type FlightListState = {
  items: FlightDto[];
  meta: FlightListMeta | null;
  sort: FlightSort;
  onlyDirect: boolean;
  isInitialLoading: boolean;
  initialError: string | null;
  isPaginationLoading: boolean;
  paginationError: string | null;
  failedPaginationPage: number | null;
  generation: number;
  loadedPages: ReadonlySet<number>;
  inFlightPages: ReadonlySet<number>;
  fetchInitial: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  changeOnlyDirect: (onlyDirect: boolean) => Promise<void>;
  changeSort: (sort: FlightSort) => Promise<void>;
  retryInitial: () => Promise<void>;
  retryPagination: () => Promise<void>;
};

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE;
}

export const useFlightListStore = create<FlightListState>((set, get) => {
  const loadFirstPage = async (
    requestGeneration: number,
    sort: FlightSort,
    onlyDirect: boolean,
  ): Promise<void> => {
    const current = get();

    if (
      current.generation !== requestGeneration ||
      current.inFlightPages.has(1)
    ) {
      return;
    }

    const inFlightPages = new Set(current.inFlightPages);
    inFlightPages.add(1);
    set({
      isInitialLoading: true,
      initialError: null,
      isPaginationLoading: false,
      paginationError: null,
      failedPaginationPage: null,
      inFlightPages,
    });

    try {
      const response = await getFlights({
        page: 1,
        limit: PAGE_LIMIT,
        sort,
        onlyDirect,
      });

      if (get().generation !== requestGeneration) {
        return;
      }

      set({
        items: response.items,
        meta: response.meta,
        isInitialLoading: false,
        initialError: null,
        loadedPages: new Set([response.meta.page]),
        inFlightPages: new Set(),
      });
    } catch (error) {
      if (get().generation !== requestGeneration) {
        return;
      }

      set({
        isInitialLoading: false,
        initialError: getErrorMessage(error),
        inFlightPages: new Set(),
      });
    }
  };

  const loadPaginationPage = async (page: number): Promise<void> => {
    const current = get();

    if (
      current.isInitialLoading ||
      current.isPaginationLoading ||
      current.loadedPages.has(page) ||
      current.inFlightPages.has(page)
    ) {
      return;
    }

    const requestGeneration = current.generation;
    const requestSort = current.sort;
    const requestOnlyDirect = current.onlyDirect;
    const inFlightPages = new Set(current.inFlightPages);
    inFlightPages.add(page);

    set({
      isPaginationLoading: true,
      paginationError: null,
      failedPaginationPage: null,
      inFlightPages,
    });

    try {
      const response = await getFlights({
        page,
        limit: PAGE_LIMIT,
        sort: requestSort,
        onlyDirect: requestOnlyDirect,
      });

      if (get().generation !== requestGeneration) {
        return;
      }

      const latest = get();
      const loadedPages = new Set(latest.loadedPages);
      loadedPages.add(response.meta.page);
      const remainingInFlightPages = new Set(latest.inFlightPages);
      remainingInFlightPages.delete(page);

      set({
        items: [...latest.items, ...response.items],
        meta: response.meta,
        isPaginationLoading: false,
        paginationError: null,
        failedPaginationPage: null,
        loadedPages,
        inFlightPages: remainingInFlightPages,
      });
    } catch (error) {
      if (get().generation !== requestGeneration) {
        return;
      }

      const remainingInFlightPages = new Set(get().inFlightPages);
      remainingInFlightPages.delete(page);

      set({
        isPaginationLoading: false,
        paginationError: getErrorMessage(error),
        failedPaginationPage: page,
        inFlightPages: remainingInFlightPages,
      });
    }
  };

  const resetForQuery = (
    sort: FlightSort,
    onlyDirect: boolean,
  ): number => {
    const generation = get().generation + 1;

    set({
      items: [],
      meta: null,
      sort,
      onlyDirect,
      isInitialLoading: false,
      initialError: null,
      isPaginationLoading: false,
      paginationError: null,
      failedPaginationPage: null,
      generation,
      loadedPages: new Set(),
      inFlightPages: new Set(),
    });

    return generation;
  };

  return {
    items: [],
    meta: null,
    sort: 'price',
    onlyDirect: false,
    isInitialLoading: false,
    initialError: null,
    isPaginationLoading: false,
    paginationError: null,
    failedPaginationPage: null,
    generation: 0,
    loadedPages: new Set(),
    inFlightPages: new Set(),

    fetchInitial: async () => {
      const current = get();

      if (
        current.meta !== null ||
        current.initialError !== null ||
        current.inFlightPages.has(1)
      ) {
        return;
      }

      await loadFirstPage(current.generation, current.sort, current.onlyDirect);
    },

    fetchNextPage: async () => {
      const current = get();

      if (
        current.meta === null ||
        !current.meta.hasMore ||
        current.paginationError !== null
      ) {
        return;
      }

      await loadPaginationPage(current.meta.page + 1);
    },

    changeOnlyDirect: async (onlyDirect) => {
      const current = get();

      if (current.onlyDirect === onlyDirect) {
        return;
      }

      const generation = resetForQuery(current.sort, onlyDirect);
      await loadFirstPage(generation, current.sort, onlyDirect);
    },

    changeSort: async (sort) => {
      const current = get();

      if (current.sort === sort) {
        return;
      }

      const generation = resetForQuery(sort, current.onlyDirect);
      await loadFirstPage(generation, sort, current.onlyDirect);
    },

    retryInitial: async () => {
      const current = get();

      if (current.initialError === null || current.inFlightPages.has(1)) {
        return;
      }

      await loadFirstPage(current.generation, current.sort, current.onlyDirect);
    },

    retryPagination: async () => {
      const current = get();

      if (
        current.paginationError === null ||
        current.failedPaginationPage === null
      ) {
        return;
      }

      await loadPaginationPage(current.failedPaginationPage);
    },
  };
});
