import { API_BASE_URL } from '@/api/config';
import { ApiError, parseApiError } from '@/api/errors';
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
let refreshPromise: Promise<string | null> | null = null;

export function setAuthFailureHandler(handler: AuthFailureHandler): void {
  authFailureHandler = handler;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function refreshAccessToken(refreshPath: string): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(buildUrl(refreshPath), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clearTokens();
    authFailureHandler?.();
    return null;
  }

  const data = (await response.json()) as { access: string };
  tokenStorage.setAccessToken(data.access);
  return data.access;
}

async function getValidAccessToken(refreshPath: string): Promise<string | null> {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) return accessToken;
  return refreshAccessToken(refreshPath);
}

async function performRefresh(refreshPath: string): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshPath).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  refreshPath = '/api/v1/auth/token/refresh/'
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

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const accessToken = await getValidAccessToken(refreshPath);
    if (!accessToken) {
      throw new ApiError(401, 'You need to sign in to continue.');
    }
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const execute = async (retryOnUnauthorized: boolean): Promise<Response> => {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    if (response.status === 401 && auth && retryOnUnauthorized) {
      const newAccessToken = await performRefresh(refreshPath);
      if (!newAccessToken) {
        throw await parseApiError(response);
      }
      requestHeaders.Authorization = `Bearer ${newAccessToken}`;
      return fetch(buildUrl(path, params), {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });
    }

    return response;
  };

  const response = await execute(true);
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
