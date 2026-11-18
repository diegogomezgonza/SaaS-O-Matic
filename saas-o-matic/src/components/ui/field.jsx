import { cn } from '@/lib/utils.js';
const inputClass =
  'flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 aria-invalid:border-destructive';
export function Field({ label, name, error, children }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
export function Input({ className, ...props }) {
  return <input className={cn(inputClass, className)} {...props} />;
}
export function Select({ className, ...props }) {
  return <select className={cn(inputClass, className)} {...props} />;
}
