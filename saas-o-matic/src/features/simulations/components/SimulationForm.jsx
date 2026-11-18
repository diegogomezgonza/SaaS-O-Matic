import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Field, Input } from '@/components/ui/field.jsx';
import { calculatePrice } from '../../../../shared/pricing.js';
import { countries } from '../../../../shared/catalog.js';
import { saveSimulation } from '../services/simulations.js';

export function SimulationForm({ customer, money, onSaved }) {
  const [values, setValues] = useState({ users: 15, storageGb: 100, apiCalls: 10000 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const validUsers =
    Number.isSafeInteger(values.users) && values.users >= 0 && values.users <= 100000;
  const quote = validUsers
    ? calculatePrice(values.users, countries.find((c) => c.code === customer.country).taxRate)
    : null;
  const update = (key, value) => {
    setValues((old) => ({ ...old, [key]: value === '' ? '' : Number(value) }));
    setSuccess('');
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await saveSimulation({ customerId: customer.id, ...values });
      onSaved();
      setSuccess('Simulación guardada en el historial.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="mt-7" aria-labelledby="simulation-title">
      <div className="mb-5">
        <h3 id="simulation-title" className="text-lg font-semibold">
          Configura la suscripción
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Explora el consumo y consulta el desglose antes de guardar.
        </p>
      </div>
      <form onSubmit={submit} className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <Field name="users" label="Usuarios activos">
            <Input
              id="users"
              type="number"
              required
              min="0"
              max="100000"
              step="1"
              value={values.users}
              onChange={(e) => update('users', e.target.value)}
              disabled={busy}
            />
            <label htmlFor="users-range" className="sr-only">
              Ajustar usuarios activos
            </label>
            <input
              id="users-range"
              aria-valuetext={`${values.users} usuarios`}
              className="mt-4 h-6 w-full accent-primary"
              type="range"
              min="0"
              max={Math.max(200, validUsers ? values.users : 200)}
              step="1"
              value={validUsers ? values.users : 0}
              onChange={(e) => update('users', e.target.value)}
              disabled={busy}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 usuarios</span>
              <span>
                {Math.max(200, validUsers ? values.users : 200).toLocaleString('es-ES')} usuarios
              </span>
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field name="storageGb" label="Almacenamiento (GB)">
              <Input
                id="storageGb"
                type="number"
                min="0"
                max="1000000"
                step="1"
                required
                value={values.storageGb}
                onChange={(e) => update('storageGb', e.target.value)}
                disabled={busy}
              />
            </Field>
            <Field name="apiCalls" label="Llamadas API / mes">
              <Input
                id="apiCalls"
                type="number"
                min="0"
                max="1000000000"
                step="1"
                required
                value={values.apiCalls}
                onChange={(e) => update('apiCalls', e.target.value)}
                disabled={busy}
              />
            </Field>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            El precio se calcula por usuarios. El almacenamiento y las llamadas API no generan
            cargos adicionales.
          </p>
        </div>
        <div
          className="min-w-0 rounded-xl bg-primary p-5 text-primary-foreground sm:p-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm opacity-85">Proyección mensual</p>
          <p
            data-testid="quote-total"
            className="my-3 break-words text-4xl font-semibold tracking-tight tabular-nums"
          >
            {quote ? money(quote.totalCents) : '—'}
          </p>
          <p className="text-xs opacity-75">Impuesto incluido</p>
          {quote && (
            <dl className="my-5 space-y-3 border-y border-white/20 py-4 text-sm">
              {quote.tiers
                .filter((t) => t.quantity)
                .map((t) => (
                  <div key={t.label} className="flex justify-between gap-2">
                    <dt className="opacity-85">
                      {t.quantity} × {money(t.unitCents)}
                    </dt>
                    <dd className="tabular-nums">{money(t.subtotalCents)}</dd>
                  </div>
                ))}
              <div className="flex justify-between gap-2 font-medium">
                <dt>Subtotal</dt>
                <dd>{money(quote.baseCents)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Impuesto ({quote.taxRate}%)</dt>
                <dd>{money(quote.taxCents)}</dd>
              </div>
            </dl>
          )}
          <Button
            type="submit"
            disabled={busy || !quote}
            className="w-full bg-white text-primary hover:bg-white/90"
          >
            <Save size={16} />
            {busy ? 'Guardando…' : 'Guardar simulación'}
          </Button>
        </div>
        <div className="xl:col-span-2">
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          {success && (
            <p
              role="status"
              className="rounded-md border border-primary/20 bg-accent p-3 text-sm text-accent-foreground"
            >
              {success}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
