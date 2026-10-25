import { apiRequest } from './api.js';

function createContentFormData(values) {
  const formData = new FormData();
  formData.set('titles', JSON.stringify(values.titles));
  formData.set('bodies', JSON.stringify(values.bodies));
  formData.set('category', values.category);
  formData.set('mediaUrl', values.mediaUrl || '');
  if (values.file) formData.set('image', values.file);
  if (values.resourceFile) formData.set('resourceFile', values.resourceFile);
  return formData;
}

export function createContent(values) {
  return apiRequest('/content', {
    method: 'POST',
    body: createContentFormData(values),
  });
}

export function updateContent(id, values) {
  return apiRequest(`/content/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: createContentFormData(values),
  });
}
