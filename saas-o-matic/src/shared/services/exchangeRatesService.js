import { request } from './http.js';
export const getExchangeRates = () => request('/exchange-rates');
