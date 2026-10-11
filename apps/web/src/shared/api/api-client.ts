import { ENV } from '../config/env';
import { ApiError, ApiClientConfig, BackendErrorPayload } from './types';

interface RefreshTokenResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

let config: ApiClientConfig = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  onTokensRefreshed: () => {},
  onUnauthorized: () => {},
};

export function configureApiClient(newConfig: ApiClientConfig): void {
  config = newConfig;
}

function getApiBaseUrl(): string {
  const rawUrl = ENV.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';
  return typeof rawUrl === 'string' ? rawUrl.replace(/\/$/, '') : '/api/v1';
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null): void {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

async function handleRefresh(): Promise<string | null> {
  const refreshToken = config.getRefreshToken();
  if (!refreshToken) {
    config.onUnauthorized();
    return null;
  }

  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const payload = (await response.json()) as RefreshTokenResponse;
    const { accessToken, refreshToken: newRefreshToken } = payload.data;

    config.onTokensRefreshed({ accessToken, refreshToken: newRefreshToken });
    return accessToken;
  } catch {
    config.onUnauthorized();
    return null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const accessToken = config.getAccessToken();
  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestUrl = `${baseUrl}${cleanEndpoint}`;

  const response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newToken) => {
          if (!newToken) {
            reject(new ApiError(401, 'Unauthorized'));
            return;
          }
          apiClient<T>(endpoint, options, true).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    const newToken = await handleRefresh();
    isRefreshing = false;

    processQueue(newToken);

    if (newToken) {
      return apiClient<T>(endpoint, options, true);
    }

    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      const errorData = (await response.json()) as BackendErrorPayload;
      if (Array.isArray(errorData.error?.message)) {
        errorMessage = errorData.error.message.join(', ');
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      errorMessage = response.statusText;
    }
    throw new ApiError(response.status, errorMessage);
  }

  return response.json() as Promise<T>;
}
