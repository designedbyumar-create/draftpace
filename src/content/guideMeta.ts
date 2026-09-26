/**
 * What Google and social cards see for a guide.
 *
 * A guide's `title` is the on-page H1, the browser tab, the search
 * result title and the schema headline all at once, and its `dek` is
 * the subheading and, by default, the search snippet. Those two jobs
 * pull in different directions for a small number of guides, so two
 * optional fields let a guide say something different to a search
 * engine than it says to a reader:
 *
 *   seoTitle          a shorter search title, when the best H1 is long
 *   metaDescription   a search snippet, when the best subheading is long
 *
 * Both are optional on purpose. Most guides should not use them: a
 * title a person would type is the same title a search engine should
 * show. guides.test.ts holds the limits.
 */

/** Appended by the root layout template when it fits. */
export const TITLE_SUFFIX = " | Draftpace";
/** Google shows about 60 characters of a title before truncating. */
export const META_TITLE_MAX = 60;
export const META_TITLE_MIN = 30;
export const META_DESCRIPTION_MAX = 155;
export const META_DESCRIPTION_MIN = 110;

type GuideMetaSource = {
  title: string;
  dek: string;
  seoTitle?: string;
  metaDescription?: string;
};

/** The title without the site suffix: what the guide wants to be called in search. */
export function guideSeoTitle(guide: GuideMetaSource): string {
  return guide.seoTitle ?? guide.title;
}

/**
 * The full <title>. The site suffix is added only when the whole thing
 * still fits in a search result; a suffix that pushes the keyword out of
 * the visible part is worse than no suffix.
 */
export function guideMetaTitle(guide: GuideMetaSource): string {
  const base = guideSeoTitle(guide);
  const withSuffix = base + TITLE_SUFFIX;
  return withSuffix.length <= META_TITLE_MAX ? withSuffix : base;
}

/** The search snippet, cut at a word boundary so it never ends mid-word. */
export function guideMetaDescription(guide: GuideMetaSource): string {
  const text = (guide.metaDescription ?? guide.dek).trim();
  if (text.length <= META_DESCRIPTION_MAX) return text;
  const cut = text.slice(0, META_DESCRIPTION_MAX + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 80 ? cut.slice(0, lastSpace) : text.slice(0, META_DESCRIPTION_MAX)).replace(/[\s,;:.-]+$/, "");
  return `${trimmed}.`;
}

/** en_GB for the UK twins, en_US for everything else. */
export function guideOgLocale(locale: string | undefined): string {
  return locale === "uk" ? "en_GB" : "en_US";
}
