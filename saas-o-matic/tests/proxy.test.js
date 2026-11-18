import { test, expect } from 'vitest';
import { createApiProxy } from '../config/api-proxy.js';

test('Vite proxies exact backend route families without capturing frontend files or legacy URLs', () => {
  const proxy = createApiProxy('http://127.0.0.1:3000');
  const pattern = new RegExp(Object.keys(proxy)[0]);
  expect(Object.values(proxy)).toEqual(['http://127.0.0.1:3000']);
  for (const path of [
    '/customers',
    '/customers?q=Norte',
    '/customers/id',
    '/customers/id/simulations',
    '/simulations',
    '/health',
    '/catalog',
    '/exchange-rates',
  ])
    expect(pattern.test(path), path).toBe(true);
  for (const path of [
    '/',
    '/src/main.jsx',
    '/assets/index.js',
    '/@vite/client',
    '/api/customers',
    '/customers-extra',
    '/simulations.js',
  ])
    expect(pattern.test(path), path).toBe(false);
});
