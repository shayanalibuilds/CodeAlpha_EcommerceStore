import { api } from './client.js';

export const register = (name, email, password) =>
  api('/auth/register', { method: 'POST', body: { name, email, password } });

export const login = (email, password) =>
  api('/auth/login', { method: 'POST', body: { email, password } });

export const me = () => api('/auth/me');

export const logout = () => api('/auth/logout', { method: 'POST' });
