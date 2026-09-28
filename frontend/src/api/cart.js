import { api } from './client.js';

export const getCart = () => api('/cart');

export const addCartItem = (productId, qty = 1) =>
  api('/cart/items', { method: 'POST', body: { productId, qty } });

export const updateCartItem = (productId, qty) =>
  api(`/cart/items/${productId}`, { method: 'PATCH', body: { qty } });

export const removeCartItem = (productId) =>
  api(`/cart/items/${productId}`, { method: 'DELETE' });
