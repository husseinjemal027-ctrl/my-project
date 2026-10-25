import { apiRequest } from './api.js';

export function getContents({ page = 1, limit = 9, category = 'all', search = '' } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category !== 'all') query.set('category', category);
  if (search.trim()) query.set('search', search.trim());
  return apiRequest(`/content?${query}`);
}

export function getMyContents({ page = 1, limit = 9 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiRequest(`/content/mine?${query}`);
}

export function getContent(id) {
  return apiRequest(`/content/${encodeURIComponent(id)}`);
}

export function deleteContent(id) {
  return apiRequest(`/content/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function registerUser(body) {
  return apiRequest('/auth/register', { method: 'POST', body });
}

export function loginUser(body) {
  return apiRequest('/auth/login', { method: 'POST', body });
}

export function getCurrentUser() {
  return apiRequest('/auth/me');
}

export function logoutUser() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export function submitContactMessage(body) {
  return apiRequest('/contact', {
    method: 'POST',
    body,
  });
}
