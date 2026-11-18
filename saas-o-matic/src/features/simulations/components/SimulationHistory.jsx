import { Button } from '@/components/ui/button.jsx';
export function SimulationHistory({ history, loading, error, retry, money }) {
  return (
    <section className="mt-8 border-t pt-7" aria-labelledby="history-title">
      <div className="mb-4 flex items-center justify-between">
        <h3 id="history-title" className="font-semibold">
          Historial de simulaciones
        </h3>
        <span className="text-xs text-muted-foreground">{history.length} guardadas</span>
      </div>
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Cargando historial…
        </p>
      ) : error ? (
        <div>
          <p role="alert" className="error-message">
            {error}
          </p>
          <Button variant="outline" onClick={retry}>
            Reintentar historial
          </Button>
        </div>
      ) : !history.length ? (
        <div className="rounded-lg border border-dashed p-6">
          <p className="text-sm font-medium">Todavía no hay presupuestos guardados</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajusta el consumo y guarda la primera simulación de este cliente.
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {history.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium">
                  {s.users.toLocaleString('es-ES')} usuarios{' '}
                  <span className="font-normal text-muted-foreground">
                    · {s.storageGb.toLocaleString('es-ES')} GB
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString('es-ES')} ·{' '}
                  {s.apiCalls.toLocaleString('es-ES')} llamadas API
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Base {money(s.quote.baseCents)} + {s.quote.taxRate}% ({money(s.quote.taxCents)})
                </p>
              </div>
              <p className="text-base font-semibold tabular-nums">
                {money(s.quote.totalCents)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">/mes</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
