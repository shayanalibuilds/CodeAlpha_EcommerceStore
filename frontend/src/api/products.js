import { api } from './client.js';

export function listProducts({ q, category, sort, includeArchived } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  if (includeArchived) params.set('includeArchived', '1');
  const qs = params.toString();
  return api(`/products${qs ? `?${qs}` : ''}`);
}

export const getProduct = (id) => api(`/products/${id}`);

export const createProduct = (body) => api('/products', { method: 'POST', body });

export const updateProduct = (id, body) => api(`/products/${id}`, { method: 'PATCH', body });
