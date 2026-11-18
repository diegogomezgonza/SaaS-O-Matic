import { test, expect } from 'vitest';
import { request as httpRequest } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openRepository } from '../server/database.js';
import { createApp } from '../server/app.js';

const customer = {
  companyName: 'Árbol Digital',
  taxId: 'B12345674',
  email: 'fixture@example.test',
  country: 'ES',
  plan: 'Business',
};

async function withApi(run) {
  const repo = openRepository(':memory:');
  const server = createApp(repo);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run({ repo, server, base });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    repo.close();
  }
}

function postChunks(server, base, chunks) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      `${base}/customers`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(text) }));
        res.on('error', reject);
      },
    );
    req.on('error', reject);
    // Send the rest only after the server receives the first chunk: no timing-based sleeps.
    server.prependOnceListener('request', (incoming) => {
      incoming.once('data', () => req.end(Buffer.concat(chunks.slice(1))));
    });
    req.write(chunks[0]);
  });
}

test.each([
  ['Árbol Digital', 'Á', 1],
  ['Estudio 東京', '東', 1],
  ['Estudio 東京', '東', 2],
  ['Equipo 🚀', '🚀', 1],
  ['Equipo 🚀', '🚀', 2],
  ['Equipo 🚀', '🚀', 3],
])('preserves %s when HTTP splits %s after byte %i', async (companyName, character, offset) => {
  await withApi(async ({ repo, server, base }) => {
    const body = Buffer.from(JSON.stringify({ ...customer, companyName }));
    const split = body.indexOf(Buffer.from(character)) + offset;
    const result = await postChunks(server, base, [body.subarray(0, split), body.subarray(split)]);
    expect(result.status).toBe(201);
    expect(result.data.companyName).toBe(companyName);
    expect(repo.get(result.data.id).companyName).toBe(companyName);
    const stored = await (await fetch(`${base}/customers/${result.data.id}`)).json();
    expect(stored.companyName).toBe(companyName);
  });
});

test('rejects invalid UTF-8 instead of persisting replacement characters', async () => {
  await withApi(async ({ repo, server, base }) => {
    const body = Buffer.from(JSON.stringify(customer));
    const index = body.indexOf(Buffer.from('Á'));
    const invalid = Buffer.concat([
      body.subarray(0, index),
      Buffer.from([0xc3, 0x28]),
      body.subarray(index + 2),
    ]);
    const result = await postChunks(server, base, [
      invalid.subarray(0, index + 1),
      invalid.subarray(index + 1),
    ]);
    expect(result.status).toBe(400);
    expect(result.data.message).toBe('El JSON no es válido.');
    expect(repo.list('')).toEqual([]);
  });
});

test('enforces the request limit in bytes for multibyte input', async () => {
  await withApi(async ({ base }) => {
    const body = JSON.stringify({ ...customer, companyName: 'á'.repeat(9000) });
    expect(body.length).toBeLessThan(16384);
    expect(Buffer.byteLength(body)).toBeGreaterThan(16384);
    const response = await fetch(`${base}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    expect(response.status).toBe(413);
  });
});

test('customer search matches Unicode case and accent variants through the REST API', async () => {
  await withApi(async ({ repo, base }) => {
    const created = repo.create(customer);
    for (const query of [
      'Árbol',
      'árbol',
      'ÁRBOL',
      'arbol',
      'a\u0301rbol',
      'B12345674',
      'b12345674',
    ]) {
      const response = await fetch(`${base}/customers?q=${encodeURIComponent(query)}`);
      expect(response.status).toBe(200);
      expect(
        (await response.json()).map((record) => record.id),
        query,
      ).toEqual([created.id]);
    }
    expect(repo.get(created.id).companyName).toBe(customer.companyName);
  });
});

test('search normalization preserves ñ, handles canonical forms, and keeps SQL input literal', () => {
  const repo = openRepository(':memory:');
  try {
    const accent = repo.create({ ...customer, companyName: 'Peña Diseño' });
    const plain = repo.create({ ...customer, companyName: 'Pena Diseno', taxId: 'C12345674' });
    for (const query of ['PEÑA', 'peña', 'pen\u0303a', 'diseño']) {
      expect(repo.list(query).map((record) => record.id)).toEqual([accent.id]);
    }
    for (const query of ['PENA', 'pena', 'diseno']) {
      expect(repo.list(query).map((record) => record.id)).toEqual([plain.id]);
    }
    expect(repo.list("' OR 1=1 --")).toEqual([]);
    expect(repo.list('%')).toEqual([]);
    expect(repo.list('')).toHaveLength(2);
  } finally {
    repo.close();
  }
});

test('Unicode search works on existing records after reopening SQLite', () => {
  const directory = mkdtempSync(join(tmpdir(), 'saas-unicode-test-'));
  const file = join(directory, 'test.sqlite');
  let repo = openRepository(file);
  try {
    const original = repo.create({ ...customer, companyName: 'A\u0301rbol Digital' });
    repo.close();
    repo = openRepository(file);
    expect(repo.list('ÁRBOL').map((record) => record.id)).toEqual([original.id]);
    expect(repo.list('arbol').map((record) => record.id)).toEqual([original.id]);
    expect(repo.get(original.id).companyName).toBe('A\u0301rbol Digital');
  } finally {
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
