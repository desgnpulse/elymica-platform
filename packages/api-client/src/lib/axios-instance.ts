import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Base Axios instance configuration
 * Handles auth tokens, tenant headers, and token refresh
 */

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  getTenantId?: () => string | null;
  onTokenRefresh?: (accessToken: string) => void;
  onAuthError?: () => void;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const {
    baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.elymica.com',
    timeout = 10000,
    getAccessToken,
    getRefreshToken,
    getTenantId,
    onTokenRefresh,
    onAuthError,
  } = config;

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Add auth and tenant headers
  client.interceptors.request.use(
    (config) => {
      const token = getAccessToken?.();
      const tenantId = getTenantId?.();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = getRefreshToken?.();

        if (refreshToken) {
          try {
            // Attempt token refresh
            const { data } = await axios.post(
              `${baseURL}/api/auth/refresh`,
              { refresh_token: refreshToken }
            );

            const newAccessToken = data.access_token;

            // Notify caller of new token
            onTokenRefresh?.(newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return client.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed - notify auth error
            onAuthError?.();
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token available
          onAuthError?.();
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}
