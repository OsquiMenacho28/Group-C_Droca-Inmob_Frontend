import axios, { type AxiosInstance } from 'axios';
import type { ApiResponse } from './types';
import { handleApiError } from './errorHandler';

/**
 * JWT Claims interface for decoded tokens
 */
export interface JwtClaims {
  sub?: string;
  userId?: string;
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  roles?: string[];
  userType?: string;
  [key: string]: unknown;
}

/**
 * Parses a JWT token to extract its payload
 */
export function parseJwt(token: string): JwtClaims | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

const BASE_URL =
  import.meta.env.VITE_API_GATEWAY_URL ||
  (import.meta.env.DEV ? '' : 'http://localhost:8080');

/**
 * Configures an Axios instance with standard interceptors
 */
function configureClient(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      const decoded = parseJwt(token);
      if (
        (decoded?.sub || decoded?.userId) &&
        !config.headers['X-Auth-User-Id']
      ) {
        config.headers['X-Auth-User-Id'] = decoded.sub || decoded.userId;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const isBinaryResponse =
        response.config.responseType === 'blob' ||
        response.config.responseType === 'arraybuffer';

      // Standardized API Response Contract handling
      if (
        !isBinaryResponse &&
        response.data &&
        typeof response.data === 'object' &&
        'success' in response.data
      ) {
        const apiResponse = response.data as ApiResponse<unknown>;

        if (!apiResponse.success) {
          // If success is false, treat it as an error
          return Promise.reject(
            handleApiError({
              response,
              message: apiResponse.message || 'Operation failed',
              errors: apiResponse.errors,
              isApiError: true,
            })
          );
        }
      }
      return response;
    },
    async (error) => {
      // Parse JSON error bodies returned as blob (e.g. PDF endpoints on 4xx/5xx)
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          error.response.data = json;
        } catch {
          // keep original blob if not JSON
        }
      }

      // Connection / Network Error
      if (!error.response && error.request) {
        console.error('Network Error - Connection refused or lost');
        // Clear tokens and force logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('must_change_password');

        const standardized = handleApiError(error);

        // Redirect if not already on login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/login?error=connection&msg=${encodeURIComponent(standardized.message)}`;
        }
        return Promise.reject(standardized);
      }

      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) throw new Error('No refresh token available');

          const axiosModule = await import('axios');
          const res = await axiosModule.default.post(
            `${instance.defaults.baseURL}/auth/refresh`,
            {
              refreshToken,
            }
          );

          // Handle standardized response for refresh token
          const authData = res.data.success ? res.data.data : res.data;
          const newAccessToken = authData.accessToken;
          const newRefreshToken = authData.refreshToken;

          if (!newAccessToken)
            throw new Error('Refresh failed - no access token in response');

          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(handleApiError(refreshError));
        }
      }
      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
}

/**
 * Versioned API clients
 */
export const apiClientV1 = configureClient(
  axios.create({
    baseURL: `${BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
  })
);

export const apiClientV2 = configureClient(
  axios.create({
    baseURL: `${BASE_URL}/api/v2`,
    headers: { 'Content-Type': 'application/json' },
  })
);

export const apiClientV7 = configureClient(
  axios.create({
    baseURL: `${BASE_URL}/api/v7`,
    headers: { 'Content-Type': 'application/json' },
  })
);

// Export v1 as default for backward compatibility
export { apiClientV1 as apiClient };
export { apiClientV1 as default };
