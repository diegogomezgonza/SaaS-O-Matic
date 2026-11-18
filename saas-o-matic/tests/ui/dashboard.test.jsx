import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '@/app/App.jsx';
import { useCustomers } from '@/features/customers/hooks/useCustomers.js';
import { useExchangeRates } from '@/shared/hooks/useExchangeRates.js';
import { getHistory, createCustomer } from '@/features/customers/services/customers.js';
import { saveSimulation } from '@/features/simulations/services/simulations.js';
vi.mock('@/features/customers/hooks/useCustomers.js', () => ({ useCustomers: vi.fn() }));
vi.mock('@/shared/hooks/useExchangeRates.js', () => ({ useExchangeRates: vi.fn() }));
vi.mock('@/features/customers/services/customers.js', () => ({
  getHistory: vi.fn(),
  createCustomer: vi.fn(),
}));
vi.mock('@/features/simulations/services/simulations.js', () => ({ saveSimulation: vi.fn() }));
const customer = {
  id: 'fixture',
  companyName: 'Estudio Norte',
  taxId: 'B12345674',
  email: 'fixture@example.test',
  country: 'ES',
  plan: 'Business',
};
function setup() {
  const directory = {
    customers: [customer],
    query: '',
    setQuery: vi.fn(),
    refresh: vi.fn(),
    loading: false,
    error: '',
  };
  const exchange = {
    data: { rates: { EUR: 1, USD: 1.1, GBP: 0.85 }, updatedAt: '2026-11-18T10:00:00Z' },
    loading: false,
    error: '',
    retry: vi.fn(),
  };
  useCustomers.mockReturnValue(directory);
  useExchangeRates.mockReturnValue(exchange);
  getHistory.mockResolvedValue([]);
  return { directory, exchange };
}

test('dashboard composes customer selection, history, currencies, create, close and save refresh', async () => {
  const { directory } = setup();
  const { unmount } = render(<App />);
  expect(screen.getByText('El siguiente presupuesto empieza con un cliente.')).toBeInTheDocument();
  expect(screen.getByText('SaaS-O-Matic', { exact: true })).toBeInTheDocument();
  fireEvent.click(screen.getByText('Registrar un cliente'));
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: /Estudio Norte/ }));
  await screen.findByText('Todavía no hay presupuestos guardados');
  fireEvent.change(screen.getByLabelText('Moneda de visualización'), { target: { value: 'USD' } });
  expect(screen.getByTestId('quote-total')).toHaveTextContent('186,34');
  fireEvent.change(screen.getByLabelText('Moneda de visualización'), { target: { value: 'GBP' } });
  expect(screen.getByTestId('quote-total')).toHaveTextContent('143,99');
  fireEvent.change(screen.getByLabelText('Moneda de visualización'), { target: { value: 'EUR' } });
  saveSimulation.mockResolvedValue({});
  fireEvent.click(screen.getByRole('button', { name: 'Guardar simulación' }));
  await screen.findByText('Simulación guardada en el historial.');
  await waitFor(() => expect(getHistory).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Registrar cliente', exact: true }));
  createCustomer.mockResolvedValue({ ...customer, id: 'new', companyName: 'Nueva empresa' });
  fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
  await screen.findByRole('heading', { name: 'Nueva empresa' });
  expect(directory.refresh).toHaveBeenCalled();
  expect(directory.setQuery).toHaveBeenCalledWith('');
  unmount();
});

test('dashboard exposes exchange loading/error/retry and history error/recovery; ignores obsolete history', async () => {
  const { exchange } = setup();
  exchange.loading = true;
  exchange.data = null;
  const { rerender, unmount } = render(<App />);
  expect(screen.getByText('Consultando tipos de cambio…')).toBeInTheDocument();
  exchange.loading = false;
  exchange.error = 'offline';
  rerender(<App />);
  fireEvent.click(screen.getByText('Reintentar cambio'));
  expect(exchange.retry).toHaveBeenCalled();
  getHistory.mockRejectedValueOnce(new Error('Historial no disponible'));
  fireEvent.click(screen.getByRole('button', { name: /Estudio Norte/ }));
  await screen.findByText('Historial no disponible');
  getHistory.mockResolvedValueOnce([]);
  fireEvent.click(screen.getByText('Reintentar historial'));
  await screen.findByText('Todavía no hay presupuestos guardados');
  // A response from a client that is no longer selected must not update the screen.
  let reject;
  getHistory.mockReturnValueOnce(
    new Promise((_, r) => {
      reject = r;
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Registrar cliente', exact: true }));
  createCustomer.mockResolvedValue({ ...customer, id: 'second', companyName: 'Otro cliente' });
  fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
  await screen.findByRole('heading', { name: 'Otro cliente' });
  const oldSignal = getHistory.mock.lastCall[1];
  unmount();
  expect(oldSignal.aborted).toBe(true);
  await act(async () => {
    reject(new Error('stale'));
    await Promise.resolve();
  });
});

test('conversion never produces NaN when a rate is unavailable', async () => {
  const { exchange } = setup();
  exchange.data.rates.USD = undefined;
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Estudio Norte/ }));
  await screen.findByText('Todavía no hay presupuestos guardados');
  fireEvent.change(screen.getByLabelText('Moneda de visualización'), { target: { value: 'USD' } });
  expect(screen.getByTestId('quote-total')).toHaveTextContent('169,40');
});

test('empty directory creation action opens the registration dialog', () => {
  const { directory } = setup();
  directory.customers = [];
  render(<App />);
  fireEvent.click(screen.getByText('Registrar primer cliente'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
