import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openRepository } from '../server/database.js';
import { createApp } from '../server/app.js';

test('REST lifecycle, security boundaries and SQLite persistence after reopening', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'client-register-test-'));
  const file = join(dir, 'test.sqlite');
  let repo = openRepository(file);
  const server = createApp(repo, {
    rates: async () => {
      throw Object.assign(new Error('Cambio temporalmente no disponible.'), { status: 503 });
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, data, headers = {}) =>
    fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(data),
    });
  try {
    const data = {
      companyName: 'Empresa fixture',
      taxId: 'B12345674',
      email: 'fixture@example.test',
      country: 'ES',
      plan: 'Business',
    };
    assert.equal((await post('/api/customers', data)).status, 404);
    assert.equal((await post('/api/simulations', {})).status, 404);
    assert.equal((await post('/customers', { ...data, taxId: 'B12345675' })).status, 422);
    assert.equal((await post('/customers', data, { Origin: 'https://evil.test' })).status, 403);
    const response = await post('/customers', data);
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const customer = await response.json();
    assert.equal((await post('/customers', data)).status, 409);
    assert.equal((await (await fetch(base + '/customers?q=FIXTURE')).json()).length, 1);
    assert.equal((await (await fetch(base + '/customers?q=%27%20OR%201%3D1')).json()).length, 0);
    const simulation = await post('/simulations', {
      customerId: customer.id,
      users: 15,
      storageGb: 100,
      apiCalls: 500,
    });
    assert.equal(simulation.status, 201);
    assert.equal((await simulation.json()).quote.totalCents, 16940);
    assert.equal(
      (
        await post('/simulations', {
          customerId: customer.id,
          users: 15,
          storageGb: 0,
          apiCalls: 0,
          totalCents: 1,
        })
      ).status,
      422,
    );
    assert.equal((await fetch(base + '/exchange-rates')).status, 503);
    assert.equal(
      (await fetch(base + '/customers/00000000-0000-0000-0000-000000000000')).status,
      404,
    );
    await new Promise((resolve) => server.close(resolve));
    repo.close();
    repo = openRepository(file);
    assert.equal(repo.get(customer.id).companyName, data.companyName);
    assert.equal(repo.history(customer.id)[0].quote.totalCents, 16940);
  } finally {
    if (server.listening) await new Promise((resolve) => server.close(resolve));
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
