import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const report = fileURLToPath(new URL('../coverage-report/index.html', import.meta.url));
if (!existsSync(report)) throw new Error('Primero ejecuta npm run test:coverage.');
const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? (existsSync(macChrome) ? macChrome : undefined),
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(pathToFileURL(report).href);
  await page.screenshot({
    path: fileURLToPath(new URL('../coverage-report/coverage.png', import.meta.url)),
    fullPage: true,
  });
  console.log('PNG generado: coverage-report/coverage.png');
} finally {
  await browser.close();
}
