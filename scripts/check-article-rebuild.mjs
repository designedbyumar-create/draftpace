import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const directory = 'audit-2026-11-16/first-article-preview';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['small-mobile', 320, 740], ['tablet', 768, 1024]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto('http://localhost:3000/guides/doctor-appointment-prep-checklist', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('heading', { name: 'Doctor appointment checklist: what to bring and ask', exact: true }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`${name}: horizontal overflow`);
    const figure = page.locator('[data-article-visual="appointment-sheet"]');
    await figure.scrollIntoViewIfNeeded();
    const loaded = await figure.isVisible();
    if (!loaded) throw new Error(`${name}: illustration did not load`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${directory}/${name}-opening.png` });
    await page.screenshot({ path: `${directory}/${name}-article.png`, fullPage: true });
    const check = page.getByRole('checkbox').first();
    await check.focus();
    await page.keyboard.press('Space');
    if (!await check.isChecked()) throw new Error('Checklist is not interactive');
    const kit = page.locator('[data-article-visual="appointment-kit"]');
    await kit.scrollIntoViewIfNeeded();
    if (!await kit.isVisible()) throw new Error('Packing visual is missing');
    const tab = page.getByRole('tab', { name: '01 You have several concerns' });
    await tab.focus();
    await page.keyboard.press('ArrowDown');
    if (await page.getByRole('tab', { name: '02 Worried about forgetting' }).getAttribute('aria-selected') !== 'true') throw new Error('Conversation keyboard navigation failed');
    await page.getByRole('tab', { name: '03 The plan is unclear' }).click();
    if (!await page.getByRole('tabpanel').filter({ visible: true }).textContent().then((text) => text.includes('say that back'))) throw new Error('Wrong conversation shown');
    await page.getByText('A video visit', { exact: true }).click();
    const anchors = await page.getByRole('navigation', { name: 'Appointment stages' }).locator('a').evaluateAll((links) => links.every((link) => document.getElementById(link.hash.slice(1))));
    if (!anchors) throw new Error('A stage link has no target');
    await page.goto('http://localhost:3000/guides/print/doctor-appointment.html');
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: `${directory}/${name}-print.png`, fullPage: true });
    if (name === 'desktop') await page.pdf({ path: `${directory}/doctor-appointment-sheet.pdf`, format: 'A4', printBackground: true });
    console.log(`${name}: article, image, checklist and print page passed`);
    await page.close();
  }
} finally {
  await browser.close();
}
