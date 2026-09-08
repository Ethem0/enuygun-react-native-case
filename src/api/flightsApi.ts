import { apiClient } from './client';
import type {
  FlightDetailResponse,
  FlightListQuery,
  FlightListResponse,
} from '../types/flight.types';

type FlightIdsQuery = Pick<FlightListQuery, 'page' | 'limit' | 'sort'>;

export function serializeFlightListQuery(query: FlightListQuery): string {
  const params = new URLSearchParams();

  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.sort !== undefined) {
    params.set('sort', query.sort);
  }
  if (query.onlyDirect !== undefined) {
    params.set('onlyDirect', String(query.onlyDirect));
  }
  if (query.ids !== undefined) {
    params.set('ids', query.ids.join(','));
  }

  return params.toString();
}

export function buildFlightListPath(query: FlightListQuery = {}): string {
  const queryString = serializeFlightListQuery(query);

  return queryString ? `/flights?${queryString}` : '/flights';
}

export function getFlights(query: FlightListQuery = {}): Promise<FlightListResponse> {
  return apiClient.get<FlightListResponse>(buildFlightListPath(query));
}

export function getFlightById(id: string): Promise<FlightDetailResponse> {
  return apiClient.get<FlightDetailResponse>(`/flights/${encodeURIComponent(id)}`);
}

export function getFlightsByIds(
  ids: string[],
  query: FlightIdsQuery = {},
): Promise<FlightListResponse> {
  if (ids.length === 0) {
    throw new TypeError('En az bir uçuş kimliği gerekli.');
  }

  return getFlights({
    ...query,
    limit: query.limit ?? 50,
    ids,
  });
}
