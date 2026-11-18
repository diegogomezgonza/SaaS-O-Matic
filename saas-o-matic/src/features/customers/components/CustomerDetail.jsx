import { Building2, MapPin, Mail } from 'lucide-react';
import { countries } from '../../../../shared/catalog.js';
export function CustomerDetail({ customer }) {
  const country = countries.find((c) => c.code === customer.country);
  return (
    <section className="border-b pb-6" aria-label="Detalle del cliente">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 size={15} />
            <span>Cliente seleccionado</span>
          </div>
          <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            {customer.companyName}
          </h2>
        </div>
        <span className="rounded-md border bg-card px-3 py-1 text-xs font-medium">
          Plan {customer.plan}
        </span>
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">Identificador fiscal</dt>
          <dd className="mt-1 break-all font-medium">{customer.taxId}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} /> Contacto
          </dt>
          <dd className="mt-1 break-all">{customer.email}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={12} /> País
          </dt>
          <dd className="mt-1">
            {country.name}{' '}
            <span className="text-muted-foreground">· {country.taxRate}% impuesto</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}
