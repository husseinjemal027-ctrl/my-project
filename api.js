import axios from 'axios';

export class ApiRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

const configuredBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    if (
      status === 401
      && (requestUrl.includes('/auth/me') || requestUrl.includes('/auth/logout') || /^\/content(?:\/|$)/.test(requestUrl))
    ) {
      window.dispatchEvent(new Event('ism:session-expired'));
    }
    const message = !error.response
      ? `Cannot connect to the backend at ${API_BASE_URL}. Start it with "npm run dev:backend" from the project root or "npm run dev" from the backend folder. If the backend is running but reports a degraded database status, check the MongoDB Atlas URI, cluster, Network Access, and TLS/network settings. CLIENT_URL must match this frontend's origin.`
      : error.response.data?.message || error.message || 'Request failed.';
    return Promise.reject(new ApiRequestError(message, status));
  },
);

export function apiRequest(path, options = {}) {
  const { body, ...requestOptions } = options;
  return apiClient.request({
    url: path,
    ...requestOptions,
    ...(body !== undefined ? { data: body } : {}),
  });
}

export function resolveMediaUrl(value) {
  if (!value) return '';
  try {
    return new URL(value, `${API_BASE_URL}/`).toString();
  } catch {
    return '';
  }
}
