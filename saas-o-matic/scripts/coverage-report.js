import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('..', import.meta.url));
const labels = {
  statements: 'Sentencias',
  branches: 'Ramas',
  functions: 'Funciones',
  lines: 'Líneas',
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const json = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

export function generateCoverageReport(checks) {
  const raw = json('coverage-report/coverage-summary.json');
  const tests = json('coverage-run.json');
  const files = Object.entries(raw)
    .filter(([name]) => name !== 'total')
    .map(([name, metrics]) => ({ name: relative(root, name).replaceAll('\\', '/'), metrics }));
  const metrics = Object.keys(labels);
  const complete = files.every((file) =>
    metrics.every((metric) => file.metrics[metric].covered === file.metrics[metric].total),
  );
  const passed =
    complete &&
    tests.success &&
    tests.numPassedTests === tests.numTotalTests &&
    Object.values(checks).every((code) => code === 0);
  const fingerprint = createHash('sha256');
  for (const file of files)
    fingerprint.update(file.name).update(readFileSync(resolve(root, file.name)));
  const data = {
    generatedAt: new Date().toISOString(),
    sourceSha256: fingerprint.digest('hex'),
    passed,
    checks,
    total: raw.total,
    files,
    tests: {
      total: tests.numTotalTests,
      passed: tests.numPassedTests,
      failed: tests.numFailedTests,
      skipped: tests.numPendingTests + tests.numTodoTests,
    },
    cases: tests.testResults.flatMap((suite) =>
      suite.assertionResults.map((item) => ({ name: item.fullName, status: item.status })),
    ),
  };
  const percent = (metric) => (metric.total === 0 ? 100 : metric.pct);
  const bar = (metric) =>
    `<div class="bar" role="progressbar" aria-label="Cobertura" aria-valuenow="${percent(metric)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${percent(metric)}%;background:${percent(metric) === 100 ? '#13804a' : '#ad2739'}"></span></div>`;
  const state = (code) => (code === 0 ? 'Correcto' : code === null ? 'No ejecutado' : 'Fallido');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SaaS-O-Matic · Cobertura de código</title><link rel="stylesheet" href="report.css"></head><body><main>
  <header><div><p class="brand">SaaS-O-Matic</p><h1>Cobertura de código</h1><p>Frontend React · API REST · SQLite · Reglas de negocio</p></div><span class="status ${passed ? 'pass' : 'fail'}">${passed ? 'Verificación completada' : 'Verificación pendiente'}</span></header>
  <p class="meta">Generado: ${escape(new Date(data.generatedAt).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }))} (Europe/Madrid) · Vitest + V8 · Objetivo: 100% por archivo</p>
  <section class="stats" aria-label="Métricas de cobertura">${metrics.map((key) => `<article><h2>${labels[key]}</h2><strong>${percent(raw.total[key])}%</strong>${bar(raw.total[key])}<p>${raw.total[key].covered} de ${raw.total[key].total} cubiertas</p></article>`).join('')}</section>
  <section class="checks"><h2>Comprobaciones</h2><dl><div><dt>Tests automatizados</dt><dd>${data.tests.passed} / ${data.tests.total} correctos · ${data.tests.failed} fallidos · ${data.tests.skipped} omitidos</dd></div><div><dt>Umbrales por archivo</dt><dd>${state(checks.unit)}</dd></div><div><dt>Acciones y responsive en Chrome</dt><dd>${state(checks.e2e)}</dd></div><div><dt>Build de producción</dt><dd>${state(checks.build)}</dd></div></dl></section>
  <nav aria-label="Acciones del informe"><a href="details/index.html">Ver código y detalle de cobertura</a><a href="coverage.png" download>Descargar PNG</a></nav>
  <section><h2>Archivos medidos</h2><div class="table-scroll"><table><thead><tr><th>Archivo</th>${metrics.map((key) => `<th>${labels[key]}</th>`).join('')}<th>Cobertura de líneas</th></tr></thead><tbody>${files.map((file) => `<tr><td><a href="details/${escape(file.name)}.html">${escape(file.name)}</a>${file.metrics.lines.total === 0 ? '<small>Reexportación sin instrucciones ejecutables</small>' : ''}</td>${metrics.map((key) => `<td class="${percent(file.metrics[key]) === 100 ? 'green' : 'red'}">${percent(file.metrics[key])}%</td>`).join('')}<td>${bar(file.metrics.lines)}</td></tr>`).join('')}</tbody></table></div></section>
  <section class="scope"><h2>Alcance y límites</h2><p>Se mide el código funcional completo de <code>src/</code>, <code>server/</code> y <code>shared/</code>. Solo se excluyen <code>src/main.jsx</code> y <code>server/index.js</code>, que arrancan React y el servidor. El arranque se comprueba mediante build y navegador. Configuración, CSS, dependencias, tests y herramientas de desarrollo no forman parte del porcentaje.</p><p>Los tests cubren validación fiscal, tarifas e impuestos, persistencia, límites y errores HTTP, origen/host, rate limit, consultas parametrizadas, XSS en renderizado, errores de red, cancelación, formularios, histórico y divisas. El navegador comprueba acciones y diseños a 320, 390, 768 y 1440 px. Se usan fixtures aislados y no datos reales de clientes.</p><p>100% de cobertura indica ejecución de las instrucciones y ramas medidas; no certifica ausencia de defectos ni sustituye auditorías de seguridad, autorización o pruebas de penetración. Los límites de despliegue y los avisos de dependencias se documentan en README y ai-workspace.</p><p class="fingerprint">SHA-256 del código medido: ${data.sourceSha256}</p></section>
  <details><summary>Casos ejecutados (${data.tests.total})</summary><ul>${data.cases.map((item) => `<li>${item.status === 'passed' ? '✓' : '✗'} ${escape(item.name)}</li>`).join('')}</ul></details>
  </main></body></html>`;
  writeFileSync(resolve(root, 'coverage-report/index.html'), html);
  writeFileSync(resolve(root, 'coverage-report/report-data.json'), JSON.stringify(data, null, 2));
  writeFileSync(
    resolve(root, 'coverage-report/report.css'),
    `:root{font:15px/1.55 system-ui,sans-serif;color:#202837;background:#f7f8fa}*{box-sizing:border-box}body{margin:0}main{max-width:1280px;margin:auto;padding:44px 40px}header{display:flex;justify-content:space-between;align-items:center;gap:20px;border-bottom:1px solid #dce0e7;padding-bottom:24px}h1{font-size:32px;letter-spacing:-1px;margin:8px 0}h2{font-size:18px;margin:0 0 16px}.brand{font-weight:700;color:#344897}p{margin:8px 0;color:#5e6879}.status{padding:9px 16px;border-radius:6px;font-weight:600}.pass{background:#e2f3e8;color:#11683e}.fail{background:#fbe8e9;color:#ad2739}.meta{font-size:12px;margin:18px 0 26px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding-bottom:30px}.stats article{background:white;border:1px solid #dce0e7;border-radius:8px;padding:20px}.stats h2{font-size:14px;color:#5e6879;margin:0}.stats strong{display:block;font-size:38px;line-height:1.5;color:#13804a}.stats p{font-size:12px}.bar{height:8px;background:#e1e5e9;border-radius:4px;overflow:hidden;min-width:80px}.bar span{display:block;height:100%}.checks{border-block:1px solid #dce0e7;padding:24px 0}dl{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin:0}dt{font-size:12px;color:#5e6879}dd{font-weight:600;margin:4px 0}nav{display:flex;flex-wrap:wrap;gap:18px;margin:24px 0}a{color:#344897;text-underline-offset:3px}section{margin-top:24px}.table-scroll{overflow:auto}table{border-collapse:collapse;width:100%;background:white;font-size:12px}th,td{text-align:left;padding:11px 12px;border-bottom:1px solid #e5e8ee}th{background:#eef0f4}td:first-child{max-width:560px;overflow-wrap:anywhere}td small{display:block;color:#5e6879}.green{color:#11683e;font-weight:600}.red{color:#ad2739;font-weight:600}.scope{border-top:1px solid #dce0e7;padding-top:24px}.scope p{font-size:13px}.fingerprint{overflow-wrap:anywhere;font-size:11px!important}details{margin-top:24px}summary{cursor:pointer;font-weight:600}li{margin:8px 0;font-size:13px}@media(max-width:700px){main{padding:24px 16px}header{align-items:flex-start;flex-direction:column}.stats{grid-template-columns:repeat(2,1fr);gap:12px}dl{grid-template-columns:1fr}h1{font-size:26px}}@media print{nav{display:none}main{padding:0}.stats article{break-inside:avoid}}`,
  );
  console.log(
    `Informe HTML: ${resolve(root, 'coverage-report/index.html')} (${passed ? 'objetivo cumplido' : 'requiere revisión'})`,
  );
}
