import { ENV } from '../config/env';

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
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
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
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  }
}

export const api = new ApiClient();
