import { Search, Building2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/field.jsx';
import { Button } from '@/components/ui/button.jsx';
import { cn } from '@/lib/utils.js';
export function CustomerSearch({
  query,
  onQuery,
  customers,
  selected,
  onSelect,
  loading,
  error,
  onRetry,
  onCreate,
}) {
  return (
    <aside
      className="min-w-0 rounded-xl border bg-card self-start lg:sticky lg:top-5"
      aria-label="Directorio de clientes"
    >
      <div className="border-b p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Clientes</h2>
          <span className="text-xs text-muted-foreground">
            {customers.length}
            {customers.length === 100 ? '+' : ''}
          </span>
        </div>
        <label htmlFor="customer-search" className="sr-only">
          Buscar por empresa o identificador fiscal
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-3.5 text-muted-foreground"
          />
          <Input
            id="customer-search"
            type="search"
            maxLength={120}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Empresa o NIF"
            className="pl-9"
          />
        </div>
      </div>
      <div aria-busy={loading} className="max-h-[440px] overflow-y-auto p-2 lg:max-h-[650px]">
        {loading ? (
          <p role="status" className="p-5 text-sm text-muted-foreground">
            Buscando clientes…
          </p>
        ) : error ? (
          <div className="p-4">
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
            <Button onClick={onRetry} variant="outline" className="mt-3">
              Reintentar
            </Button>
          </div>
        ) : customers.length ? (
          customers.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              aria-pressed={selected?.id === c.id}
              className={cn(
                'group flex min-h-20 w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted',
                selected?.id === c.id && 'bg-accent',
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
                <Building2 size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.companyName}</span>
                <span className="block truncate text-xs text-muted-foreground mt-1">
                  {c.taxId} · {c.plan}
                </span>
              </span>
              <ChevronRight size={15} className="shrink-0 text-muted-foreground" />
            </button>
          ))
        ) : (
          <div className="p-5 text-sm">
            {query && <p className="font-medium">Sin coincidencias</p>}
            <p className="mt-2 text-muted-foreground">
              {query
                ? 'Prueba otro nombre o identificador fiscal.'
                : 'Registra una empresa para preparar su primera simulación.'}
            </p>
            {!query && (
              <Button onClick={onCreate} variant="outline" className="mt-4">
                Registrar primer cliente
              </Button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
