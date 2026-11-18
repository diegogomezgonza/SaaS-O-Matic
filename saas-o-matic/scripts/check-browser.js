import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, existsSync } from 'node:fs';
import { createServer } from 'vite';
import { openRepository } from '../server/database.js';
import { createApp } from '../server/app.js';
import { createApiProxy } from '../config/api-proxy.js';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const repo = openRepository(':memory:');
const api = createApp(repo, { allowedOrigins: ['http://127.0.0.1:5174'] });
await new Promise((resolve) => api.listen(3101, '127.0.0.1', resolve));
const vite = await createServer({
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    proxy: createApiProxy('http://127.0.0.1:3101'),
  },
});
await vite.listen();
let browser;
const errors = [];
const resultDir = 'test-results';
mkdirSync(resultDir, { recursive: true });
try {
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? (existsSync(macChrome) ? macChrome : undefined),
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  const writes = new Set();
  page.on('request', (request) => {
    if (request.method() === 'POST') writes.add(new URL(request.url()).pathname);
  });
  // Deterministic fixture only in this browser test; production always uses the live provider.
  await page.route('**/exchange-rates', (route) =>
    route.fulfill({
      json: { rates: { EUR: 1, USD: 1.1, GBP: 0.85 }, updatedAt: new Date().toISOString() },
    }),
  );
  await page.goto('http://127.0.0.1:5174');
  assert.equal(await page.title(), 'SaaS-O-Matic');
  await page.getByText('SaaS-O-Matic', { exact: true }).waitFor();
  await page.getByText('Registra una empresa para preparar su primera simulación.').waitFor();
  await page.getByRole('button', { name: 'Registrar cliente', exact: true }).click();
  await page.getByLabel('Nombre de empresa', { exact: true }).fill('Estudio Norte · Fixture');
  await page.getByLabel('Identificador fiscal', { exact: true }).fill('B12345675');
  await page.getByLabel('Email de contacto').fill('fixture@example.test');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Registrar cliente', exact: true })
    .click();
  await page.getByText('El DNI, NIE o NIF no supera el control de validación.').waitFor();
  await page.getByLabel('Identificador fiscal', { exact: true }).fill('B12345674');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Registrar cliente', exact: true })
    .click();
  await page.getByRole('heading', { name: 'Estudio Norte · Fixture' }).waitFor();
  await page.getByText('169,40', { exact: false }).first().waitFor();
  await page.getByRole('button', { name: 'Guardar simulación' }).click();
  await page.getByText('Simulación guardada en el historial.').waitFor();
  await page.getByText('1 guardadas').waitFor();
  await page.getByLabel('Usuarios activos', { exact: true }).fill('51');
  assert.match(await page.getByTestId('quote-total').innerText(), /514,25/);
  await page.getByRole('slider').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.getByLabel('Usuarios activos', { exact: true }).inputValue(), '50');
  await page.getByLabel('Moneda de visualización').selectOption('USD');
  assert.match(await page.getByTestId('quote-total').innerText(), /559,02/);
  await page.getByLabel('Moneda de visualización').selectOption('GBP');
  assert.match(await page.getByTestId('quote-total').innerText(), /431,97/);
  await page.getByLabel('Moneda de visualización').selectOption('EUR');
  await page.reload();
  await page.getByRole('button', { name: /Estudio Norte/ }).click();
  await page.getByText('1 guardadas').waitFor();
  await page.getByLabel('Buscar por empresa o identificador fiscal').fill('no-existe');
  await page.getByText('Sin coincidencias', { exact: true }).waitFor();
  await page.getByLabel('Buscar por empresa o identificador fiscal').fill('B12345674');
  await page.getByRole('button', { name: /Estudio Norte/ }).waitFor();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.reload();
    await page.getByRole('button', { name: /Estudio Norte/ }).click();
    await page.getByText('1 guardadas').waitFor();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.screenshot({ path: `${resultDir}/dashboard-${width}.png`, fullPage: true });
    if ([1440, 390].includes(width)) {
      await page.screenshot({ path: `${resultDir}/preview-${width}.png`, fullPage: false });
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      `overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Registrar cliente', exact: true }).click();
  await page.screenshot({ path: `${resultDir}/form-mobile.png`, fullPage: true });
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.getByLabel('Usuarios activos', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Guardar simulación' }).click();
  await page.getByText('2 guardadas').waitFor();
  await page.route('**/simulations', (route) =>
    route.fulfill({ status: 503, json: { message: 'No se pudo guardar. Reintenta.' } }),
  );
  await page.getByRole('button', { name: 'Guardar simulación' }).click();
  await page.getByRole('alert').getByText('No se pudo guardar. Reintenta.').waitFor();
  await page.unroute('**/simulations');
  await page.getByRole('button', { name: 'Guardar simulación' }).click();
  await page.getByText('3 guardadas').waitFor();
  await page.unroute('**/exchange-rates');
  await page.route('**/exchange-rates', (route) =>
    route.fulfill({ status: 503, json: { message: 'Proveedor no disponible' } }),
  );
  await page.reload();
  await page.getByText('Cambio no disponible. Puedes trabajar en EUR.').waitFor();
  assert.equal(await page.locator('#currency option[value="USD"]').isDisabled(), true);
  await page.getByRole('button', { name: 'Reintentar cambio' }).click();
  await page.getByText('Cambio no disponible. Puedes trabajar en EUR.').waitFor();
  await page.unroute('**/exchange-rates');
  await page.route('**/exchange-rates', (route) =>
    route.fulfill({
      json: { rates: { EUR: 1, USD: 1.1, GBP: 0.85 }, updatedAt: new Date().toISOString() },
    }),
  );
  await page.getByRole('button', { name: 'Reintentar cambio' }).click();
  await page
    .locator('#currency option[value="USD"]:not([disabled])')
    .waitFor({ state: 'attached' });
  assert.equal(await page.locator('#currency option[value="USD"]').isDisabled(), false);
  await page.getByRole('button', { name: 'Registrar cliente', exact: true }).click();
  await page.getByLabel('Nombre de empresa', { exact: true }).fill('Árbol Diseño · Fixture');
  await page.getByLabel('Identificador fiscal', { exact: true }).fill('C12345674');
  await page.getByLabel('Email de contacto').fill('unicode-fixture@example.test');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Registrar cliente', exact: true })
    .click();
  await page.getByRole('heading', { name: 'Árbol Diseño · Fixture', exact: true }).waitFor();
  for (const query of ['arbol', 'ÁRBOL', 'árbol']) {
    await page.getByLabel('Buscar por empresa o identificador fiscal').fill(query);
    await page.getByRole('button', { name: /Árbol Diseño/ }).click();
    await page.getByRole('heading', { name: 'Árbol Diseño · Fixture', exact: true }).waitFor();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual([...writes].sort(), ['/customers', '/simulations']);
  console.log(
    'PASS: registration, invalid NIF, search, selection, quote, slider, saving, history, reload, USD/GBP, provider failure/retry, dialog Escape, Unicode registration and accented/unaccented search; no overflow at 320/390/768/1440; no JS errors.',
  );
} finally {
  await browser?.close();
  await vite.close();
  await new Promise((resolve) => api.close(resolve));
  repo.close();
}
