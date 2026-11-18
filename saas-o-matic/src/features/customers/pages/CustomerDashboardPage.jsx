import { useEffect, useState } from 'react';
import { Plus, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Select } from '@/components/ui/field.jsx';
import { useExchangeRates } from '@/shared/hooks/useExchangeRates.js';
import { formatCurrency } from '@/shared/lib/formatters.js';
import { CustomerSearch } from '../components/CustomerSearch.jsx';
import { CustomerForm } from '../components/CustomerForm.jsx';
import { CustomerDetail } from '../components/CustomerDetail.jsx';
import { useCustomers } from '../hooks/useCustomers.js';
import { getHistory } from '../services/customers.js';
import { SimulationForm } from '../../simulations/components/SimulationForm.jsx';
import { SimulationHistory } from '../../simulations/components/SimulationHistory.jsx';

export function CustomerDashboardPage() {
  const directory = useCustomers();
  const exchange = useExchangeRates();
  const [currency, setCurrency] = useState('EUR');
  const [customer, setCustomer] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [version, setVersion] = useState(0);
  const refreshHistory = () => setVersion((v) => v + 1);
  useEffect(() => {
    if (!customer) return;
    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError('');
    setHistory([]);
    getHistory(customer.id, controller.signal)
      .then(setHistory)
      .catch((err) => {
        if (!controller.signal.aborted) setHistoryError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, [customer, version]);
  const money = (cents) =>
    formatCurrency(
      (cents / 100) * (currency === 'EUR' ? 1 : (exchange.data?.rates[currency] ?? 1)),
      currency,
    );
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Clientes y presupuestos
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Registra clientes, calcula el coste de sus suscripciones y consulta sus presupuestos.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Registrar cliente
        </Button>
      </div>
      <div className="mb-7 flex flex-wrap items-center justify-end gap-3 border-y py-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            {exchange.loading
              ? 'Consultando tipos de cambio…'
              : exchange.error
                ? 'Cambio no disponible. Puedes trabajar en EUR.'
                : null}
          </span>
          {exchange.error && (
            <Button size="sm" variant="outline" onClick={exchange.retry}>
              Reintentar cambio
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="currency">Moneda de visualización</label>
          <Select
            id="currency"
            title={
              exchange.data
                ? `Fecha del tipo de cambio: ${new Date(exchange.data.updatedAt).toLocaleDateString('es-ES')}`
                : undefined
            }
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="min-h-9 w-24 py-1"
          >
            <option value="EUR">EUR</option>
            <option value="USD" disabled={!exchange.data}>
              USD
            </option>
            <option value="GBP" disabled={!exchange.data}>
              GBP
            </option>
          </Select>
        </div>
      </div>
      <div className="grid items-start gap-7 lg:grid-cols-[290px_minmax(0,1fr)] xl:gap-10">
        <CustomerSearch
          query={directory.query}
          onQuery={directory.setQuery}
          customers={directory.customers}
          selected={customer}
          onSelect={setCustomer}
          loading={directory.loading}
          error={directory.error}
          onRetry={directory.refresh}
          onCreate={() => setFormOpen(true)}
        />
        <div className="min-w-0">
          {customer ? (
            <>
              <CustomerDetail customer={customer} />
              <SimulationForm
                key={customer.id}
                customer={customer}
                money={money}
                onSaved={refreshHistory}
              />
              <SimulationHistory
                history={history}
                loading={historyLoading}
                error={historyError}
                retry={refreshHistory}
                money={money}
              />
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Los importes son estimados y no incluyen exenciones ni ajustes fiscales específicos.
                El presupuesto original se conserva en EUR; otras monedas usan el cambio mostrado.
              </p>
            </>
          ) : (
            <section className="flex min-h-[440px] flex-col items-start justify-center border-b py-12 lg:pl-8">
              <ReceiptText size={36} strokeWidth={1.3} className="mb-6 text-primary" />
              <h2 className="max-w-sm text-2xl font-semibold tracking-tight">
                El siguiente presupuesto empieza con un cliente.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Selecciona una empresa del directorio o registra una nueva. Aquí verás sus datos, el
                simulador de consumo y sus presupuestos guardados.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setFormOpen(true)}>
                Registrar un cliente
              </Button>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-xs text-muted-foreground">
                <span>Tarifa progresiva por usuarios</span>
                <span>Impuestos por país</span>
                <span>EUR · USD · GBP</span>
              </div>
            </section>
          )}
        </div>
      </div>
      {formOpen && (
        <CustomerForm
          onClose={() => setFormOpen(false)}
          onCreated={(created) => {
            directory.setQuery('');
            directory.refresh();
            setCustomer(created);
            setFormOpen(false);
          }}
        />
      )}
    </>
  );
}
