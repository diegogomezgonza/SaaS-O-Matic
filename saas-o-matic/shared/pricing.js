export function calculatePrice(users, taxRate) {
  if (!Number.isSafeInteger(users) || users < 0 || users > 100000)
    throw new RangeError('Número de usuarios no válido.');
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100)
    throw new RangeError('Impuesto no válido.');
  const tiers = [
    { label: 'Primeros 10 usuarios', quantity: Math.min(users, 10), unitCents: 1000 },
    {
      label: 'Del usuario 11 al 50',
      quantity: Math.min(Math.max(users - 10, 0), 40),
      unitCents: 800,
    },
    { label: 'A partir del usuario 51', quantity: Math.max(users - 50, 0), unitCents: 500 },
  ].map((tier) => ({ ...tier, subtotalCents: tier.quantity * tier.unitCents }));
  const baseCents = tiers.reduce((sum, tier) => sum + tier.subtotalCents, 0);
  // Money stays in integer cents; rounding occurs once on the tax amount.
  const taxCents = Math.round((baseCents * taxRate) / 100);
  return { baseCents, taxRate, taxCents, totalCents: baseCents + taxCents, tiers };
}
