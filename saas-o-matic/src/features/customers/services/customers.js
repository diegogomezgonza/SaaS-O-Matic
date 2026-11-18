import { request } from '@/shared/services/http.js';
export const listCustomers = (query, signal) =>
  request(`/customers?q=${encodeURIComponent(query)}`, { signal });
export const createCustomer = (data) =>
  request('/customers', { method: 'POST', body: JSON.stringify(data) });
export const getHistory = (id, signal) => request(`/customers/${id}/simulations`, { signal });
