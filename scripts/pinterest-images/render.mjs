/**
 * Renders the 8 Pinterest catalog images, one per paid published product.
 *
 *   node scripts/run-tsx.mjs scripts/pinterest-images/render.mjs [slug ...]
 *
 * Pinterest's own catalog spec requires the image_link asset to be at
 * least 1000x1500 pixels (portrait, 2:3). The existing /store/*-1-cover
 * images are 1600x1200 (landscape 4:3) and the Shop page's own media,
 * so neither can serve this field; this is a separate, Pinterest-only
 * image, built from the same real brand assets already produced for the
 * Etsy listing images (the printed cover crop and a real phone screen,
 * via scripts/etsy-images), not a new design invented from scratch.
 *
 * Requires .etsy-images/_pages and .etsy-images/_screens to already
 * exist (produced by the Etsy pipeline). Output: public/store/pinterest/
 * <slug>.webp, 2000x3000, which the Pinterest feed route reads and which
 * does ship with the app, unlike .etsy-images/ itself.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { readFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

import { travelCompanionDefinition } from "../../src/products/travel-companion/definition";
import { homeschoolingCompanionDefinition } from "../../src/products/homeschooling-companion/definition";
import { personalLifeAffairsCompanionDefinition } from "../../src/products/personal-life-affairs-companion/definition";
import { vehicleMaintenanceCompanionDefinition } from "../../src/products/vehicle-maintenance-companion/definition";
import { familyHealthBinderDefinition } from "../../src/products/family-health-binder/definition";
import { personalFinanceCompanionDefinition } from "../../src/products/personal-finance-companion/definition";
import { alongsideDefinition } from "../../src/products/alongside/definition";
import { homeManagementCompanionDefinition } from "../../src/products/home-management-companion/definition";

import { travelCompanionShopProduct } from "../../src/shop/products/travel-companion";
import { homeschoolingCompanionShopProduct } from "../../src/shop/products/homeschooling-companion";
import { personalLifeAffairsCompanionShopProduct } from "../../src/shop/products/personal-life-affairs-companion";
import { vehicleMaintenanceCompanionShopProduct } from "../../src/shop/products/vehicle-maintenance-companion";
import { familyHealthBinderShopProduct } from "../../src/shop/products/family-health-binder";
import { personalFinanceCompanionShopProduct } from "../../src/shop/products/personal-finance-companion";
import { alongsideShopProduct } from "../../src/shop/products/alongside";
import { homeManagementCompanionShopProduct } from "../../src/shop/products/home-management-companion";

import { getAreaForProduct } from "../../src/content/areas";

const PRODUCTS = [
  { slug: "travel-companion", definition: travelCompanionDefinition, shopProduct: travelCompanionShopProduct },
  { slug: "homeschooling-companion", definition: homeschoolingCompanionDefinition, shopProduct: homeschoolingCompanionShopProduct },
  { slug: "personal-life-affairs-companion", definition: personalLifeAffairsCompanionDefinition, shopProduct: personalLifeAffairsCompanionShopProduct },
  { slug: "vehicle-maintenance-companion", definition: vehicleMaintenanceCompanionDefinition, shopProduct: vehicleMaintenanceCompanionShopProduct },
  { slug: "family-health-binder", definition: familyHealthBinderDefinition, shopProduct: familyHealthBinderShopProduct },
  { slug: "personal-finance-companion", definition: personalFinanceCompanionDefinition, shopProduct: personalFinanceCompanionShopProduct },
  { slug: "alongside", definition: alongsideDefinition, shopProduct: alongsideShopProduct },
  { slug: "home-management-companion", definition: homeManagementCompanionDefinition, shopProduct: homeManagementCompanionShopProduct },
];

const PAGES_DIR = path.resolve(process.cwd(), ".etsy-images/_pages");
const SCREENS_DIR = path.resolve(process.cwd(), ".etsy-images/_screens");
const FONTS_DIR = path.resolve(process.cwd(), "public/fonts");
const OUT_DIR = path.resolve(process.cwd(), "public/store/pinterest");

async function dataUri(filePath, mime) {
  const bytes = await readFile(filePath);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function findByPrefix(dir, prefix) {
  const files = await readdir(dir);
  const match = files.find((f) => f.startsWith(prefix));
  if (!match) throw new Error(`No file found for prefix "${prefix}" in ${dir}`);
  return path.join(dir, match);
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function html(p, coverImg, screenImg, newsreaderSrc, plexSrc) {
  const area = getAreaForProduct(p.slug);
  const category = area?.label ?? "Draftpace";
  const a = p.definition.theme.accentScale;
  const title = p.shopProduct.title;
  const promise = p.shopProduct.promise;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    :root{ --a:${a.base}; --as:${a.soft}; --ad:${a.strong}; }
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1000px;height:1500px;background:#fdfbf8;font-family:Plex,sans-serif;color:#221f1a}
    @font-face{font-family:Newsreader;src:url(${newsreaderSrc}) format('truetype');font-weight:400 800}
    @font-face{font-family:Plex;src:url(${plexSrc}) format('truetype');font-weight:400 700}
    .cv{width:1000px;height:1500px;position:relative;background:#fdfbf8;overflow:hidden}
    .spine{position:absolute;top:0;left:0;right:0;height:10px;background:var(--a)}
    .chrome-top{position:absolute;top:40px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;z-index:5}
    .brand{font-size:15px;letter-spacing:2.2px;color:var(--a);text-transform:uppercase;font-weight:700}
    .cat{font-size:13px;letter-spacing:1.6px;color:#9a9187;text-transform:uppercase;font-weight:700}
    .stage{position:absolute;top:118px;left:0;right:0;height:900px}
    .glow{position:absolute;left:50%;top:40px;width:620px;height:760px;transform:translateX(-50%);border-radius:80px;filter:blur(90px);opacity:0.38;background:var(--a)}
    .pageimg{position:absolute;box-shadow:0 60px 100px -32px rgba(20,15,10,0.4),0 0 0 1px rgba(0,0,0,0.04);border:1px solid #e5ddcf;background:#fff}
    .phonewrap{position:absolute}
    .phoneimg{display:block;border-radius:30px;box-shadow:0 46px 80px -26px rgba(20,15,10,0.48),0 0 0 1px rgba(0,0,0,0.05)}
    .tag{position:absolute;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:99px;background:var(--a);color:#fff;font-size:17px;font-weight:700;letter-spacing:0.3px;white-space:nowrap;box-shadow:0 16px 28px -10px rgba(0,0,0,0.35)}
    .copy{position:absolute;left:64px;right:64px;top:1038px;text-align:center}
    .eyebrow{font-size:17px;letter-spacing:2px;color:var(--a);text-transform:uppercase;font-weight:700}
    .h1{font-family:Newsreader;font-weight:700;font-size:64px;line-height:1.08;color:#1a1712;margin-top:18px;text-wrap:balance}
    .lede{font-size:25px;line-height:1.5;color:#413c35;margin-top:22px;font-weight:500;max-width:820px;margin-left:auto;margin-right:auto}
    .chrome-bottom{position:absolute;bottom:44px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;font-size:14px;color:#9a9187;letter-spacing:0.5px;font-weight:700}
  </style></head>
  <body><div class="cv">
    <div class="spine"></div>
    <div class="chrome-top"><span class="brand">Draftpace</span><span class="cat">${esc(category)}</span></div>
    <div class="stage">
      <div class="glow"></div>
      <img class="pageimg" src="${coverImg}" style="left:120px;top:40px;width:470px;transform:rotate(-6deg)">
      <div class="phonewrap" style="right:90px;top:260px">
        <img class="phoneimg" src="${screenImg}" style="height:560px;transform:rotate(5deg)">
      </div>
      <div class="tag" style="bottom:8px">Printable PDF + App</div>
    </div>
    <div class="copy">
      <div class="eyebrow">Printable PDF + the real app</div>
      <div class="h1">${esc(title)}</div>
      <div class="lede">${esc(promise)}</div>
    </div>
    <div class="chrome-bottom"><span>Instant download</span><span>draftpace.com</span></div>
  </div></body></html>`;
}

async function main() {
  const only = process.argv.slice(3).filter(Boolean);
  const products = PRODUCTS.filter((p) => !only.length || only.includes(p.slug));

  await mkdir(OUT_DIR, { recursive: true });

  const newsreaderSrc = await dataUri(path.join(FONTS_DIR, "Newsreader.ttf"), "font/ttf");
  const plexSrc = await dataUri(path.join(FONTS_DIR, "IBMPlexSans.ttf"), "font/ttf");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1500 }, deviceScaleFactor: 2 });

  for (const product of products) {
    const coverPath = await findByPrefix(PAGES_DIR, `${product.slug}-cover-`);
    const screenPath = await findByPrefix(SCREENS_DIR, `${product.slug}-0.`);
    const [coverImg, screenImg] = await Promise.all([
      dataUri(coverPath, "image/png"),
      dataUri(screenPath, "image/png"),
    ]);

    await page.setContent(html(product, coverImg, screenImg, newsreaderSrc, plexSrc), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot();

    const target = path.join(OUT_DIR, `${product.slug}.webp`);
    await sharp(png).resize(2000, 3000, { fit: "cover" }).webp({ quality: 90, effort: 5 }).toFile(target);
    console.log(`public/store/pinterest/${product.slug}.webp`);
  }

  await browser.close();
}

await main();
