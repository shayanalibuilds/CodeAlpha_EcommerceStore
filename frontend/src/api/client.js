// Thin fetch wrapper for the Northwind Market API.
// - Attaches the JWT bearer token when present
// - Parses JSON error bodies into ApiError { status, message, fields }
const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'nw_token';

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || {};
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the store API. Is the backend running?');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // 204s and empty bodies are fine
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status}).`, data?.fields);
  }
  return data;
}
