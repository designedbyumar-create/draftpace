import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
await mkdir('audit-2026-11-16/visual-correction', { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2, colorScheme: 'light' });
  for (const [slug, images, base] of [
    ['doctor-appointment-prep-checklist', [['appointment-sheet', 'doctor-appointment-sheet-v4'], ['appointment-kit', 'doctor-appointment-kit-v4']], 'doctor-appointment'],
    ['four-day-homeschool-week', [['learning-rhythm', 'four-day-homeschool-rhythm-v4'], ['learning-record', 'four-day-homeschool-record-v4']], 'four-day-homeschool'],
  ]) {
    await page.goto('http://localhost:3000/guides/' + slug, { waitUntil: 'networkidle', timeout: 120000 });
    for (const [key, name] of images) {
      const visual = page.locator(`[data-article-visual="${key}"]`);
      await visual.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      const bytes = await visual.screenshot();
      await sharp(bytes).resize(1200, 900, { fit: 'contain', background: '#ffffff' }).webp({ quality: 92 }).toFile('public/guides/img/' + name + '.webp');
      await sharp(bytes).png().toFile('audit-2026-11-16/visual-correction/' + key + '.png');
      if (key === images[0][0]) {
        for (const [kind, width, height] of [['share', 1200, 630], ['thumb', 800, 600]]) {
          await sharp(bytes).resize(width, height, { fit: 'contain', background: '#ffffff' }).webp({ quality: 92 }).toFile(`public/guides/img/${base}-${kind}-v4.webp`);
        }
      }
    }
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await page.setViewportSize({ width, height });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
      await page.waitForFunction(() => document.querySelectorAll('[data-article-visual]').length === 2);
      const forbidden = await page.locator('article').innerText();
      if (/AI-generated|illustrative setup|DRAFTPACE \/ VISIT PREP/i.test(forbidden)) throw new Error('Rejected visual label still present');
      await page.evaluate(() => window.scrollTo(0,0));
      await page.screenshot({ path: `audit-2026-11-16/visual-correction/${slug}-${name}.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 1440, height: 1200 });
    console.log(slug + ': native visuals captured; desktop/mobile layout and label checks passed');
  }
} finally { await browser.close(); }
