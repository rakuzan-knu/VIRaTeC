import { ENV } from '../config/env';

export class ApiError extends Error {
  public status: number;
  public response?: { status: number; data?: unknown };
  public data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.response = { status, data };
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('viratec_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      let errData: any = null;
      try {
        errData = await res.json();
      } catch {
        // ignore
      }
      const message = errData?.message || `API Error: ${res.status} ${res.statusText}`;
      throw new ApiError(res.status, message, errData);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let errData: any = null;
      try {
        errData = await res.json();
      } catch {
        // ignore
      }
      const message = errData?.message || `API Error: ${res.status} ${res.statusText}`;
      throw new ApiError(res.status, message, errData);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }
}

export const api = new ApiClient();
