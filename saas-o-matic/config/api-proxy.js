// Match only backend routes so Vite can still serve HTML, source modules and assets.
export function createApiProxy(target) {
  return { '^/(customers|simulations|health|catalog|exchange-rates)(?:[/?]|$)': target };
}
