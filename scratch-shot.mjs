import { chromium } from 'playwright';

const outDir = 'C:\\Users\\jeanc\\Documents\\Side-Project\\CV\\.shots';
const fs = await import('fs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto('http://localhost:4302/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${outDir}\\01-hero.png` });

await page.locator('a[href="#carte"]').first().click({ force: true }).catch(() => {});
await page.evaluate(() => document.querySelector('#carte')?.scrollIntoView());
await page.waitForTimeout(1200);
await page.screenshot({ path: `${outDir}\\02-map.png` });

// click the golf pin button and wedding pin button to verify fly-to works
const buttons = await page.locator('.map-panel__nav button').all();
for (const b of buttons) {
  const text = (await b.textContent())?.trim();
  console.log('pin button:', text);
}
if (buttons.length >= 4) {
  await buttons[3].click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${outDir}\\03-map-golf.png` });
  await buttons[2].click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${outDir}\\04-map-wedding.png` });
}

await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView());
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}\\05-contact.png` });

await page.locator('.lang-pill').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${outDir}\\06-contact-en.png` });

console.log('CONSOLE_ERRORS:', JSON.stringify(errors));
await browser.close();
