export interface BackendErrorPayload {
  statusCode: number;
  error: {
    message: string | string[];
  };
}

export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export interface ApiClientConfig {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed: (tokens: { accessToken: string; refreshToken: string }) => void;
  onUnauthorized: () => void;
}
