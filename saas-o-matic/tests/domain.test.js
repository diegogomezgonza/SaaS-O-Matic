import { test } from 'vitest';
import assert from 'node:assert/strict';
import { calculatePrice } from '../shared/pricing.js';
import { isSpanishTaxId, normalizeTaxId } from '../server/domain/tax-id.js';
import { validateCustomer, validateSimulation } from '../server/validation.js';

test('progressive tiers at every boundary and cents rounding', () => {
  for (const [users, base] of [
    [0, 0],
    [1, 1000],
    [10, 10000],
    [11, 10800],
    [15, 14000],
    [50, 42000],
    [51, 42500],
    [100000, 50017000],
  ]) {
    assert.equal(calculatePrice(users, 21).baseCents, base);
  }
  assert.equal(calculatePrice(15, 21).totalCents, 16940);
  assert.equal(calculatePrice(51, 19).taxCents, 8075);
  for (const value of [-1, 1.5, NaN, Infinity, 100001, '15'])
    assert.throws(() => calculatePrice(value, 21));
});
test('Spanish DNI, NIE, special NIF and entity checksums', () => {
  for (const id of [
    '12345678Z',
    'X1234567L',
    'Y1234567X',
    'Z1234567R',
    'B12345674',
    'A58818501',
    'P2345678C',
    'K1234567L',
  ])
    assert.ok(isSpanishTaxId(id), id);
  for (const id of [
    '12345678A',
    'X1234567A',
    'B12345675',
    'A5881850A',
    'P23456783',
    'ZZZ',
    '<script>',
  ])
    assert.equal(isSpanishTaxId(id), false, id);
  assert.equal(normalizeTaxId(' b-12345674 '), 'B12345674');
});
test('customer validation rejects mass assignment and unknown countries', () => {
  const data = {
    companyName: 'Empresa de prueba',
    taxId: 'B12345674',
    email: 'DEMO@example.test',
    country: 'ES',
    plan: 'Business',
  };
  assert.equal(validateCustomer(data).email, 'demo@example.test');
  for (const change of [
    { taxId: 'B12345675' },
    { email: 'invalid' },
    { country: 'US' },
    { plan: 'unknown' },
    { admin: true },
  ])
    assert.throws(() => validateCustomer({ ...data, ...change }));
});
test('usage validation rejects negatives, fractions, oversized values and supplied prices', () => {
  const data = {
    customerId: '00000000-0000-0000-0000-000000000001',
    users: 15,
    storageGb: 100,
    apiCalls: 500,
  };
  assert.deepEqual(validateSimulation(data), data);
  for (const change of [
    { users: -1 },
    { users: 1.5 },
    { storageGb: 1000001 },
    { apiCalls: '3' },
    { totalCents: 1 },
  ])
    assert.throws(() => validateSimulation({ ...data, ...change }));
});
