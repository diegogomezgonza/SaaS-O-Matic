import { request } from '@/shared/services/http.js';
export const saveSimulation = (data) =>
  request('/simulations', { method: 'POST', body: JSON.stringify(data) });
