/**
 * "It works like an app", the one section both public product surfaces
 * must carry, and carry accurately: the free product's front door
 * (/free) and a paid product's detail page (/shop/[productSlug]).
 *
 * This used to exist in two places that had drifted apart. /free had a
 * real section for it: a heading, a one-line promise, and a three-column
 * iPhone/Android/computer breakdown. The paid page had one dense
 * paragraph buried in its last tab, saying the same true thing far
 * less clearly and far less visibly. Extracting the free page's version
 * (the better of the two, not a new design) means every future paid
 * product gets the good version too, and the two surfaces can no longer
 * quietly diverge.
 *
 * Every claim here is true of the shipped PWA: each product serves its
 * own manifest, scoped to its own routes, with its own icon and name.
 * iOS gets an instruction rather than a prompt because Safari never
 * fires beforeinstallprompt (see src/lib/pwa/hooks.ts); Android and
 * desktop Chromium get a real one-tap install. That split is why this
 * is three short blocks rather than one paragraph: a reader on an
 * iPhone should be able to find their own instruction without reading
 * the other two.
 *
 * src/__regression__/installable-everywhere.test.ts reads this file's
 * source directly (concatenated with each page that renders it) to
 * assert all three platforms stay covered. Keep the covering phrases
 * ("without an app store", "Add to Home Screen", "Android", "Chrome and
 * Edge") intact if this copy is ever revised.
 */
export default function PwaInstallSection({
  productName,
  accent,
}: {
  /** The name it installs as: a product's pwa.shortName when it has one, otherwise its title. */
  productName: string;
  /** Tints the eyebrow. Omit for the platform default (used on /free, which has no single product accent). */
  accent?: string;
}) {
  return (
    <div>
      <p className="text-eyebrow font-bold uppercase" style={{ color: accent ?? "var(--brand-ink)" }}>
        On your devices
      </p>
      <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
        It works like an app, without an app store.
      </h2>
      <p className="mt-5 max-w-[42rem] text-body leading-relaxed text-[var(--muted)]">
        {productName} runs in your browser, and installs to your phone from there. No App Store, no Play Store, no
        download, and no update to remember. Add it once and it gets its own icon and its own window, like any other
        app on your phone.
      </p>
      <div className="mt-9 grid gap-7 sm:grid-cols-3">
        <div>
          <p className="text-body-sm font-bold text-[var(--text)]">On iPhone and iPad</p>
          <p className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">
            Open it in Safari, tap Share, then Add to Home Screen. It opens full screen from then on, with no browser
            bar.
          </p>
        </div>
        <div>
          <p className="text-body-sm font-bold text-[var(--text)]">On Android</p>
          <p className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">
            Chrome offers to install it, or you can tap Install in the product&apos;s own settings. One tap and it is
            on your home screen.
          </p>
        </div>
        <div>
          <p className="text-body-sm font-bold text-[var(--text)]">On computers</p>
          <p className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">
            It works in any modern browser as it is. Chrome and Edge will also install it as its own desktop window
            if you would rather it were not a tab.
          </p>
        </div>
      </div>
    </div>
  );
}
