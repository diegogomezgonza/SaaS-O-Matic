import { Layers2 } from 'lucide-react';
export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#workspace" className="skip-link">
        Ir al contenido
      </a>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers2 size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">SaaS-O-Matic</p>
              <p className="text-xs text-muted-foreground">Clientes y suscripciones</p>
            </div>
          </div>
        </div>
      </header>
      <main id="workspace" className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        {children}
      </main>
      <footer className="mx-auto max-w-[1440px] px-5 pb-8 text-xs text-muted-foreground sm:px-8 lg:px-12">
        Importes base en EUR. Las conversiones utilizan el tipo de cambio indicado.
      </footer>
    </div>
  );
}
