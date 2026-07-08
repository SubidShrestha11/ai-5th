import { API_BASE_URL } from '@/api/config';
import { parseApiError } from '@/api/errors';
import { tokenStorage } from '@/api/tokenStorage';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

type AuthFailureHandler = () => void;

let authFailureHandler: AuthFailureHandler | null = null;

export function setAuthFailureHandler(handler: AuthFailureHandler): void {
  authFailureHandler = handler;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  if (!API_BASE_URL) {
    throw new Error(
      'API is not configured. Set VITE_API_BASE_URL when building the app.'
    );
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    auth = true,
    headers = {},
    signal,
  } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  const sentAccessToken = requestHeaders.Authorization?.startsWith('Bearer ')
    ? requestHeaders.Authorization.slice(7)
    : null;

  const response = await fetch(buildUrl(path, params), {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
    signal,
  });

  if (response.status === 401 && auth) {
    if (sentAccessToken) {
      tokenStorage.clearTokens();
      authFailureHandler?.();
    }
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

export function captureAuthTokens(data: Record<string, unknown>): void {
  if (typeof data.access === 'string') {
    const refresh = typeof data.refresh === 'string' ? data.refresh : '';
    tokenStorage.setTokens(data.access, refresh);
  }
}

export async function postAuthRequest<T>(
  path: string,
  body: unknown,
  extract: (data: Record<string, unknown>) => T
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const data = (await response.json()) as Record<string, unknown>;
  captureAuthTokens(data);
  return extract(data);
}
