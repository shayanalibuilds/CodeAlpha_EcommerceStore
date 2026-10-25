import { api } from './client.js';

export const createOrder = (address, paymentMethod) =>
  api('/orders', { method: 'POST', body: { address, paymentMethod } });

export const listOrders = (scope) => api(`/orders${scope === 'all' ? '?scope=all' : ''}`);

export const getOrder = (id) => api(`/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  api(`/orders/${id}/status`, { method: 'PATCH', body: { status } });

// Customers may cancel their own order while it is still "placed".
export const cancelOrder = (id) => api(`/orders/${id}/cancel`, { method: 'POST' });
