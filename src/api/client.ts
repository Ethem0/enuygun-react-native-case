import { Platform } from 'react-native';

import type { ApiErrorResponse } from '../types/flight.types';

type ApiErrorCode = ApiErrorResponse['error']['code'];

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: ApiErrorCode,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiClient = {
  get<TResponse>(path: string): Promise<TResponse>;
};

const defaultBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';

export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') || defaultBaseUrl;

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }

  const error = value.error;

  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

export function createApiClient(baseUrl: string): ApiClient {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    async get<TResponse>(path: string): Promise<TResponse> {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const response = await fetch(`${normalizedBaseUrl}${normalizedPath}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      let body: unknown;

      try {
        body = await response.json();
      } catch {
        body = undefined;
      }

      if (!response.ok) {
        if (isApiErrorResponse(body)) {
          throw new ApiError(body.error.message, response.status, body.error.code);
        }

        throw new ApiError('Sunucudan beklenmeyen bir yanıt alındı.', response.status);
      }

      return body as TResponse;
    },
  };
}

export const apiClient = createApiClient(apiBaseUrl);
