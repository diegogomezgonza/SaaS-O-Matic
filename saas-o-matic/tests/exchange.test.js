import { test } from 'vitest';
import assert from 'node:assert/strict';
import { getRates } from '../server/exchange-rates.js';

test('external rates reject malformed, stale and unsafe data; validated data is cached', async () => {
  const originalFetch = globalThis.fetch;
  const valid = {
    result: 'success',
    base_code: 'EUR',
    time_last_update_unix: Date.now() / 1000,
    rates: { EUR: 1, USD: 1.1, GBP: 0.85 },
  };
  try {
    for (const data of [
      null,
      {},
      { ...valid, base_code: 'USD' },
      { ...valid, rates: { EUR: 1, USD: -1, GBP: 1 } },
      { ...valid, time_last_update_unix: 1 },
      { ...valid, time_last_update_unix: Date.now() / 1000 + 10000 },
    ]) {
      globalThis.fetch = async () => ({ ok: true, json: async () => data });
      await assert.rejects(getRates, (error) => error.status === 503);
    }
    globalThis.fetch = async () => ({ ok: false });
    await assert.rejects(getRates, (error) => error.status === 503);
    globalThis.fetch = async () => ({ ok: true, json: async () => valid });
    const data = await getRates();
    assert.equal(data.rates.USD, 1.1);
    globalThis.fetch = async () => {
      throw new Error('offline');
    };
    assert.equal(await getRates(), data);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
