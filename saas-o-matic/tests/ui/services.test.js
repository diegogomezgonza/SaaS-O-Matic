import { test, expect, vi } from 'vitest';
import { request } from '@/shared/services/http.js';
import {
  listCustomers,
  createCustomer,
  getHistory,
} from '@/features/customers/services/customers.js';
import { saveSimulation } from '@/features/simulations/services/simulations.js';
import { getExchangeRates } from '@/shared/services/exchangeRatesService.js';
import { formatCurrency } from '@/shared/lib/formatters.js';

test('HTTP serializes services, encodes searches, preserves abort, and normalizes failures', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal('fetch', fetch);
  await request('/health');
  expect(fetch.mock.lastCall[0]).toBe('/health');
  const signal = new AbortController().signal;
  await listCustomers("x' &", signal);
  expect(fetch).toHaveBeenLastCalledWith(
    "/customers?q=x'%20%26",
    expect.objectContaining({ signal }),
  );
  await createCustomer({ companyName: 'Fixture' });
  expect(fetch.mock.lastCall[0]).toBe('/customers');
  expect(fetch.mock.lastCall[1].body).toBe('{"companyName":"Fixture"}');
  await getHistory('id');
  expect(fetch.mock.lastCall[0]).toBe('/customers/id/simulations');
  await saveSimulation({ users: 3 });
  expect(fetch.mock.lastCall[0]).toBe('/simulations');
  expect(fetch.mock.lastCall[1].body).toBe('{"users":3}');
  await getExchangeRates();
  expect(fetch.mock.lastCall[0]).toBe('/exchange-rates');
  await request('/health', { headers: { 'X-Test': 'yes' } });
  expect(fetch.mock.lastCall[1].headers['X-Test']).toBe('yes');
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ message: 'Invalid', fields: { email: 'Email' } }),
  });
  await expect(request('/customers')).rejects.toMatchObject({
    message: 'Invalid',
    fields: { email: 'Email' },
  });
  fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
  await expect(request('/customers')).rejects.toThrow('No se pudo completar la solicitud.');
  fetch.mockRejectedValue(new Error('Network private info'));
  await expect(request('/customers')).rejects.toThrow('No se pudo conectar con el servidor.');
  const controller = new AbortController();
  controller.abort();
  const aborted = new DOMException('aborted', 'AbortError');
  fetch.mockRejectedValue(aborted);
  await expect(request('/customers', { signal: controller.signal })).rejects.toBe(aborted);
  expect(formatCurrency(10)).toContain('10,00');
  expect(formatCurrency(12, 'USD', 'en-US')).toBe('$12.00');
});
