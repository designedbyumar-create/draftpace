import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const directory = 'audit-2026-11-16/second-article-preview';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['small-mobile', 320, 740], ['tablet', 768, 1024]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://localhost:3000/guides/four-day-homeschool-week', { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByRole('heading', { name: 'Four-day homeschool week: a schedule that adds up', exact: true }).waitFor();
    if (name === 'desktop') {
      const imageUrl = await page.locator('meta[property="og:image"]').first().getAttribute('content');
      const imagePath = new URL(imageUrl, 'http://localhost:3000');
      const response = await page.request.get('http://localhost:3000' + imagePath.pathname + imagePath.search);
      if (!response.ok()) throw new Error('Share image route failed');
      const metadata = await sharp(await response.body()).metadata();
      if (metadata.width !== 1200 || metadata.height !== 630) throw new Error('Wrong share image dimensions');
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${name}: horizontal overflow`);
    const images = page.locator('[data-article-visual]');
    if (await images.count() !== 2) throw new Error('Expected two article illustrations');
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      if (!await img.isVisible()) throw new Error('Native visual is not visible');
    }
    const week = page.getByRole('list', { name: 'Friday open sample week' });
    await week.waitFor();
    await page.getByRole('radio', { name: 'Wednesday open Breathing room in the middle' }).check();
    await page.getByRole('list', { name: 'Wednesday open sample week' }).waitFor();
    const lessons = page.getByRole('spinbutton', { name: 'Lessons remaining' });
    await lessons.fill('144');
    await page.getByText('The count fits at this pace.', { exact: true }).waitFor();
    await lessons.fill('');
    await page.getByText('Use whole numbers:', { exact: false }).waitFor();
    await lessons.fill('145');
    await page.getByText('37 teaching weeks', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Reset lesson calculator', exact: true }).click();
    if (await lessons.inputValue() !== '180') throw new Error('Calculator did not reset');
    const box = page.getByRole('checkbox').first();
    await box.focus(); await page.keyboard.press('Space');
    if (!await box.isChecked()) throw new Error('Checkbox keyboard activation failed');
    await page.getByRole('radio', { name: 'Friday open Four days, then a longer gap' }).check();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${directory}/${name}-opening.png` });
    await page.screenshot({ path: `${directory}/${name}-article.png`, fullPage: true });
    if (errors.length) throw new Error(errors.join('\n'));
    await page.goto('http://localhost:3000/guides/print/four-day-homeschool.html');
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: `${directory}/${name}-worksheet.png`, fullPage: true });
    if (name === 'desktop') await page.pdf({ path: `${directory}/four-day-week.pdf`, format: 'A4', printBackground: true });
    console.log(`${name}: layout, two images, schedule switching, calculator, keyboard checklist and worksheet passed`);
    await page.close();
  }
} finally { await browser.close(); }
