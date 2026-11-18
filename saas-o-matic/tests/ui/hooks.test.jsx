import { test, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCustomers } from '@/features/customers/hooks/useCustomers.js';
import { useExchangeRates } from '@/shared/hooks/useExchangeRates.js';
import { listCustomers } from '@/features/customers/services/customers.js';
import { getExchangeRates } from '@/shared/services/exchangeRatesService.js';
vi.mock('@/features/customers/services/customers.js', () => ({ listCustomers: vi.fn() }));
vi.mock('@/shared/services/exchangeRatesService.js', () => ({ getExchangeRates: vi.fn() }));

test('customer search debounces, refreshes, recovers from errors, and ignores aborted requests', async () => {
  vi.useFakeTimers();
  let rejectOld;
  listCustomers
    .mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectOld = reject;
        }),
    )
    .mockResolvedValue([{ id: 'fixture' }]);
  const { result, unmount } = renderHook(useCustomers);
  await act(() => vi.advanceTimersByTimeAsync(200));
  const oldSignal = listCustomers.mock.calls[0][1];
  act(() => result.current.setQuery('Norte'));
  expect(oldSignal.aborted).toBe(true);
  await act(async () => {
    rejectOld(new Error('obsolete'));
    await Promise.resolve();
  });
  expect(result.current.error).toBe('');
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(result.current.customers).toEqual([{ id: 'fixture' }]);
  listCustomers.mockRejectedValueOnce(new Error('Sin conexión'));
  act(() => result.current.refresh());
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(result.current.error).toBe('Sin conexión');
  expect(result.current.loading).toBe(false);
  act(() => result.current.refresh());
  await act(() => vi.advanceTimersByTimeAsync(200));
  expect(result.current.error).toBe('');
  unmount();
});
test('exchange loading, successful retry, timeout and ordinary errors', async () => {
  getExchangeRates
    .mockRejectedValueOnce(new DOMException('slow', 'TimeoutError'))
    .mockRejectedValueOnce(new Error('No disponible'))
    .mockResolvedValue({ rates: { EUR: 1 } });
  const { result } = renderHook(useExchangeRates);
  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.error).toContain('tardó demasiado'));
  await act(() => result.current.retry());
  expect(result.current.error).toBe('No disponible');
  await act(() => result.current.retry());
  expect(result.current.data.rates.EUR).toBe(1);
  expect(result.current.error).toBe('');
  expect(result.current.loading).toBe(false);
});
