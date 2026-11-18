import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Field, Input, Select } from '@/components/ui/field.jsx';
import { createCustomer } from '../services/customers.js';
import { countries, plans } from '../../../../shared/catalog.js';

export function CustomerForm({ onCreated, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({});
  // Native dialog supplies focus trapping, Escape and focus restoration.
  const attach = (node) => {
    if (node && !node.open) node.showModal();
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFields({});
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      onCreated(await createCustomer(data));
    } catch (err) {
      setError(err.message);
      setFields(err.fields ?? {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={attach}
      onCancel={(event) => {
        if (busy) event.preventDefault();
        else onClose();
      }}
      aria-labelledby="new-customer-title"
      className="customer-dialog"
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="new-customer-title" className="text-xl font-semibold">
              Registrar cliente
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Datos de la empresa para preparar sus presupuestos.
            </p>
          </div>
          <Button variant="ghost" aria-label="Cerrar formulario" onClick={onClose} disabled={busy}>
            ✕
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['companyName', 'Nombre de empresa', 'text', 'Ej. Estudio Norte'],
            ['taxId', 'Identificador fiscal', 'text', 'DNI, NIE o NIF'],
            ['email', 'Email de contacto', 'email', 'contacto@empresa.com'],
          ].map(([name, label, type, placeholder]) => (
            <Field key={name} name={name} label={label} error={fields[name]}>
              <Input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                required
                maxLength={name === 'email' ? 254 : 120}
                autoFocus={name === 'companyName'}
                aria-invalid={!!fields[name]}
                aria-describedby={fields[name] ? `${name}-error` : undefined}
              />
            </Field>
          ))}
          <Field name="country" label="País" error={fields.country}>
            <Select id="country" name="country" defaultValue="ES">
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field name="plan" label="Plan elegido" error={fields.plan}>
            <Select id="plan" name="plan" defaultValue="Business">
              {plans.map((plan) => (
                <option key={plan}>{plan}</option>
              ))}
            </Select>
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">
          En España se comprueba el dígito de control del identificador fiscal.
        </p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Registrando…' : 'Registrar cliente'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
