import { useEffect, useState } from 'react';
import { getExchangeRates } from '@/shared/services/exchangeRatesService.js';
export function useExchangeRates() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function retry() {
    setLoading(true);
    setError('');
    try {
      setData(await getExchangeRates());
    } catch (err) {
      setError(
        err.name === 'TimeoutError'
          ? 'El proveedor tardó demasiado. Reintenta la conexión.'
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    retry();
  }, []);
  return { data, loading, error, retry };
}
