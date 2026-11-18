import { ApiError } from './validation.js';
let cache;
export async function getRates() {
  if (cache && Date.now() - cache.fetchedAt < 3600000) return cache;
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/EUR', {
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    const updatedAt = Number(data.time_last_update_unix) * 1000;
    if (
      data.result !== 'success' ||
      data.base_code !== 'EUR' ||
      !Number.isFinite(updatedAt) ||
      Date.now() - updatedAt > 7 * 86400000 ||
      updatedAt > Date.now() + 3600000
    )
      throw new Error();
    const rates = Object.fromEntries(
      ['EUR', 'USD', 'GBP'].map((code) => [code, data.rates?.[code]]),
    );
    if (
      rates.EUR !== 1 ||
      Object.values(rates).some((rate) => !Number.isFinite(rate) || rate <= 0 || rate > 100000)
    )
      throw new Error();
    cache = { rates, updatedAt: new Date(updatedAt).toISOString(), fetchedAt: Date.now() };
    return cache;
  } catch {
    throw new ApiError(
      503,
      'No se pudo conectar con el proveedor de cambio. Puedes seguir trabajando en EUR.',
    );
  }
}
