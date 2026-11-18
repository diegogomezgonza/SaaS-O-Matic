import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CustomerForm } from '@/features/customers/components/CustomerForm.jsx';
import { CustomerSearch } from '@/features/customers/components/CustomerSearch.jsx';
import { SimulationForm } from '@/features/simulations/components/SimulationForm.jsx';
import { SimulationHistory } from '@/features/simulations/components/SimulationHistory.jsx';
import { createCustomer } from '@/features/customers/services/customers.js';
import { saveSimulation } from '@/features/simulations/services/simulations.js';
import { formatCurrency } from '@/shared/lib/formatters.js';
vi.mock('@/features/customers/services/customers.js', () => ({ createCustomer: vi.fn() }));
vi.mock('@/features/simulations/services/simulations.js', () => ({ saveSimulation: vi.fn() }));
const customer = {
  id: 'fixture',
  companyName: '<img src=x onerror=alert(1)>',
  taxId: 'B12345674',
  email: 'fixture@example.test',
  country: 'ES',
  plan: 'Business',
};
const money = (cents) => formatCurrency(cents / 100);

test('customer registration displays field and generic errors, blocks cancel while saving, and completes', async () => {
  const onClose = vi.fn(),
    onCreated = vi.fn();
  createCustomer
    .mockRejectedValueOnce(
      Object.assign(new Error('Revisa los datos'), { fields: { taxId: 'NIF inválido' } }),
    )
    .mockRejectedValueOnce(new Error('Fallo temporal'));
  const { container } = render(<CustomerForm onClose={onClose} onCreated={onCreated} />);
  fireEvent.change(screen.getByLabelText('Nombre de empresa'), { target: { value: 'Fixture' } });
  fireEvent.change(screen.getByLabelText('Identificador fiscal'), {
    target: { value: 'B12345674' },
  });
  fireEvent.change(screen.getByLabelText('Email de contacto'), {
    target: { value: 'fixture@example.test' },
  });
  fireEvent.submit(container.querySelector('form'));
  await screen.findByText('NIF inválido');
  expect(screen.getByLabelText('Identificador fiscal')).toHaveAttribute('aria-invalid', 'true');
  fireEvent.submit(container.querySelector('form'));
  await screen.findByText('Fallo temporal');
  let resolve;
  createCustomer.mockReturnValueOnce(
    new Promise((r) => {
      resolve = r;
    }),
  );
  fireEvent.submit(container.querySelector('form'));
  expect(screen.getByText('Registrando…')).toBeDisabled();
  const event = new Event('cancel', { bubbles: false, cancelable: true });
  fireEvent(container.querySelector('dialog'), event);
  expect(event.defaultPrevented).toBe(true);
  expect(onClose).not.toHaveBeenCalled();
  await act(async () => resolve(customer));
  expect(onCreated).toHaveBeenCalledWith(customer);
  fireEvent(container.querySelector('dialog'), new Event('cancel', { cancelable: true }));
  expect(onClose).toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar formulario' }));
  expect(onClose).toHaveBeenCalledTimes(3);
});

test('directory renders loading, retry, empty search, creation, selection and capped result count safely', () => {
  const props = {
    query: '',
    onQuery: vi.fn(),
    customers: [],
    selected: null,
    onSelect: vi.fn(),
    onRetry: vi.fn(),
    onCreate: vi.fn(),
    loading: true,
    error: '',
  };
  const { rerender, container } = render(<CustomerSearch {...props} />);
  expect(screen.getByText('Buscando clientes…')).toBeInTheDocument();
  rerender(<CustomerSearch {...props} loading={false} error="Sin conexión" />);
  fireEvent.click(screen.getByText('Reintentar'));
  expect(props.onRetry).toHaveBeenCalled();
  rerender(<CustomerSearch {...props} loading={false} />);
  fireEvent.click(screen.getByText('Registrar primer cliente'));
  expect(props.onCreate).toHaveBeenCalled();
  rerender(<CustomerSearch {...props} query="none" loading={false} />);
  expect(screen.getByText('Sin coincidencias')).toBeInTheDocument();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'NIF' } });
  expect(props.onQuery).toHaveBeenCalledWith('NIF');
  rerender(<CustomerSearch {...props} customers={[customer]} loading={false} />);
  fireEvent.click(screen.getByRole('button', { name: /img src/ }));
  expect(props.onSelect).toHaveBeenCalledWith(customer);
  expect(container.querySelector('img')).toBeNull();
  rerender(
    <CustomerSearch
      {...props}
      selected={customer}
      customers={Array.from({ length: 100 }, (_, i) => ({ ...customer, id: String(i) }))}
      loading={false}
    />,
  );
  expect(screen.getByText('100+')).toBeInTheDocument();
  rerender(
    <CustomerSearch {...props} selected={customer} customers={[customer]} loading={false} />,
  );
  expect(screen.getByRole('button', { name: /img src/ })).toHaveAttribute('aria-pressed', 'true');
});

test('simulation keeps slider and inputs in sync, disables invalid quotes, preserves server errors and retries', async () => {
  const onSaved = vi.fn();
  const { container } = render(
    <SimulationForm customer={customer} money={money} onSaved={onSaved} />,
  );
  expect(screen.getByTestId('quote-total')).toHaveTextContent('169,40');
  fireEvent.change(screen.getByLabelText('Usuarios activos'), { target: { value: '' } });
  expect(screen.getByTestId('quote-total')).toHaveTextContent('—');
  expect(screen.getByRole('button')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Usuarios activos'), { target: { value: '100001' } });
  expect(screen.getByRole('button')).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Usuarios activos'), { target: { value: '500' } });
  expect(screen.getByRole('slider')).toHaveAttribute('max', '500');
  fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } });
  expect(screen.getByLabelText('Usuarios activos')).toHaveValue(0);
  expect(screen.getByTestId('quote-total')).toHaveTextContent('0,00');
  fireEvent.change(screen.getByLabelText('Almacenamiento (GB)'), { target: { value: '250' } });
  fireEvent.change(screen.getByLabelText('Llamadas API / mes'), { target: { value: '2000' } });
  saveSimulation.mockRejectedValueOnce(new Error('No se pudo guardar'));
  fireEvent.submit(container.querySelector('form'));
  await screen.findByRole('alert');
  expect(onSaved).not.toHaveBeenCalled();
  let resolve;
  saveSimulation.mockReturnValueOnce(
    new Promise((r) => {
      resolve = r;
    }),
  );
  fireEvent.submit(container.querySelector('form'));
  expect(screen.getByText('Guardando…')).toBeDisabled();
  await act(async () => resolve({}));
  expect(onSaved).toHaveBeenCalled();
  expect(screen.getByRole('status')).toHaveTextContent('Simulación guardada');
  expect(saveSimulation).toHaveBeenLastCalledWith({
    customerId: 'fixture',
    users: 0,
    storageGb: 250,
    apiCalls: 2000,
  });
});

test('history handles loading, retry, empty and saved totals', () => {
  const retry = vi.fn();
  const props = { history: [], money, retry };
  const { rerender } = render(<SimulationHistory {...props} loading />);
  expect(screen.getByRole('status')).toHaveTextContent('Cargando historial');
  rerender(<SimulationHistory {...props} error="Error historial" />);
  fireEvent.click(screen.getByText('Reintentar historial'));
  expect(retry).toHaveBeenCalled();
  rerender(<SimulationHistory {...props} />);
  expect(screen.getByText('Todavía no hay presupuestos guardados')).toBeInTheDocument();
  rerender(
    <SimulationHistory
      {...props}
      history={[
        {
          id: 'sim',
          users: 15,
          storageGb: 100,
          apiCalls: 1000,
          createdAt: '2026-11-18T10:00:00Z',
          quote: { baseCents: 14000, taxRate: 21, taxCents: 2940, totalCents: 16940 },
        },
      ]}
    />,
  );
  expect(screen.getByText('1 guardadas')).toBeInTheDocument();
  expect(screen.getByText(/169,40/)).toBeInTheDocument();
});
