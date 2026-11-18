import { test, expect, vi } from 'vitest';
import { request as httpRequest } from 'node:http';
import { connect } from 'node:net';
import { openRepository } from '../server/database.js';
import { createApp } from '../server/app.js';
import { calculatePrice } from '../shared/pricing.js';
import { validateCustomer, validateSimulation } from '../server/validation.js';
import { isSpanishTaxId } from '../server/domain/tax-id.js';

const fixture = {
  companyName: 'Empresa fixture',
  taxId: 'B12345674',
  email: 'fixture@example.test',
  country: 'ES',
  plan: 'Business',
};
test('validation rejects malformed bodies, overflow, unsupported metadata and accepts foreign identifiers', () => {
  for (const input of [
    null,
    [],
    1,
    'text',
    {},
    { ...fixture, companyName: 42 },
    { ...fixture, companyName: 'a'.repeat(121) },
    { ...fixture, email: 'a'.repeat(250) + '@b.test' },
    { ...fixture, taxId: '<svg>' },
  ])
    expect(() => validateCustomer(input)).toThrow();
  expect(validateCustomer({ ...fixture, country: 'FR', taxId: 'FR123' }).taxId).toBe('FR123');
  for (const input of [
    {},
    { customerId: 'bad', users: 0, storageGb: 0, apiCalls: 0 },
    { customerId: 3, users: 0, storageGb: 0, apiCalls: 0 },
  ])
    expect(() => validateSimulation(input)).toThrow();
  for (const tax of [-1, 101, NaN, Infinity]) expect(() => calculatePrice(10, tax)).toThrow();
  expect(calculatePrice(0, 0).totalCents).toBe(0);
  expect(isSpanishTaxId('C12345674')).toBe(true);
  expect(isSpanishTaxId('C1234567D')).toBe(true);
  expect(isSpanishTaxId('C1234567A')).toBe(false);
});

test('HTTP rejects oversized, malformed, foreign-origin and wrong-host requests; safe failures and all read paths', async () => {
  const repo = openRepository(':memory:');
  const rates = { rates: { EUR: 1, USD: 1.1, GBP: 0.85 } };
  const server = createApp(repo, { rates: async () => rates });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  try {
    expect((await fetch(base + '/health')).status).toBe(200);
    expect((await (await fetch(base + '/catalog')).json()).countries).toHaveLength(5);
    expect(await (await fetch(base + '/exchange-rates')).json()).toEqual(rates);
    expect((await fetch(base + '/customers?q=' + 'a'.repeat(121))).status).toBe(422);
    for (const headers of [
      {},
      { 'Content-Type': 'text/plain' },
      { 'Content-Type': 'application/json-evil' },
    ])
      expect(
        (await fetch(base + '/customers', { method: 'POST', headers, body: '{}' })).status,
      ).toBe(415);
    expect(
      (
        await fetch(base + '/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await fetch(base + '/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: ' '.repeat(17000),
        })
      ).status,
    ).toBe(413);
    expect(
      (await fetch(base + '/health', { headers: { Origin: 'http://localhost:5173' } })).status,
    ).toBe(200);
    const wrongHost = await new Promise((resolve, reject) => {
      const req = httpRequest(base + '/health', { headers: { Host: 'attacker.test' } }, (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      req.on('error', reject);
      req.end();
    });
    expect(wrongHost).toBe(403);
    const missingHost = await new Promise((resolve, reject) => {
      const socket = connect(port, '127.0.0.1', () => socket.end('GET /health HTTP/1.0\r\n\r\n'));
      let data = '';
      socket.on('data', (chunk) => {
        data += chunk;
      });
      socket.on('end', () => resolve(data));
      socket.on('error', reject);
    });
    expect(missingHost).toContain('403');
    // Omitted content type must be rejected even when no implicit fetch text header is present.
    const noType = await new Promise((resolve, reject) => {
      const req = httpRequest(base + '/customers', { method: 'POST' }, (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      req.on('error', reject);
      req.end('{}');
    });
    expect(noType).toBe(415);
    const customer = repo.create(fixture);
    expect((await (await fetch(base + '/customers/' + customer.id)).json()).taxId).toBe(
      fixture.taxId,
    );
    expect(await (await fetch(base + '/customers/' + customer.id + '/simulations')).json()).toEqual(
      [],
    );
    expect(
      (
        await fetch(base + '/simulations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: '00000000-0000-0000-0000-000000000000',
            users: 1,
            storageGb: 0,
            apiCalls: 0,
          }),
        })
      ).status,
    ).toBe(404);
    expect((await fetch(base + '/unknown')).status).toBe(404);
    const spy = vi.spyOn(repo, 'list').mockImplementation(() => {
      throw new Error('SQL secret /private/path');
    });
    const error = await fetch(base + '/customers');
    expect(error.status).toBe(500);
    expect(await error.json()).toEqual({ message: 'No se pudo completar la operación.' });
    spy.mockRestore();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    repo.close();
  }
});

test('rate limit rejects request 301 and permits requests after expiry', async () => {
  const repo = openRepository(':memory:');
  const server = createApp(repo);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/health`;
  try {
    for (let i = 0; i < 300; i++) expect((await fetch(url)).status).toBe(200);
    expect((await fetch(url)).status).toBe(429);
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + 60001);
    expect((await fetch(url)).status).toBe(200);
  } finally {
    vi.restoreAllMocks();
    await new Promise((resolve) => server.close(resolve));
    repo.close();
  }
});
