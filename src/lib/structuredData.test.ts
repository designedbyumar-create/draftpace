import { describe, expect, it } from "vitest";
import { breadcrumbStructuredData, collectionStructuredData, guideStructuredData, jsonLd } from "./structuredData";

const guide = {
  slug: "what-is-due-on-my-car-right-now",
  title: "How to know what maintenance your car is due for",
  dek: "Work out what is due by miles and by months.",
  publishedAt: "2026-09-26",
};
const trail = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
  { name: "Vehicles", path: "/guides/vehicles" },
  { name: guide.title, path: `/guides/${guide.slug}` },
];

/**
 * A structured-data mistake never fails a build and never shows on the
 * page, so these are the only thing between a wrong entity and a search
 * engine believing it.
 */
describe("guide structured data", () => {
  const graph = guideStructuredData(guide, { description: "d", trail, areaLabel: "Vehicles", areaPath: "/guides/vehicles", wordCount: 800 })["@graph"];

  it("is an Article and a BreadcrumbList in one graph", () => {
    expect(graph.map((node) => node["@type"])).toEqual(["Article", "BreadcrumbList"]);
  });

  it("numbers the breadcrumb from 1 and ends on the guide itself", () => {
    const crumbs = graph[1] as ReturnType<typeof breadcrumbStructuredData>;
    expect(crumbs.itemListElement.map((c) => c.position)).toEqual([1, 2, 3, 4]);
    expect(crumbs.itemListElement.at(-1)?.item).toBe(`https://draftpace.com/guides/${guide.slug}`);
  });

  it("refers to one Organization by id, and never to a person it did not name", () => {
    const article = graph[0] as { author: { "@type": string; "@id": string }; publisher: { "@id": string } };
    expect(article.author["@type"]).toBe("Organization");
    expect(article.author["@id"]).toBe(article.publisher["@id"]);
  });

  it("says which country a UK twin is for", () => {
    const uk = guideStructuredData({ ...guide, locale: "uk" }, { description: "d", trail })["@graph"][0] as { inLanguage: string };
    expect(uk.inLanguage).toBe("en-GB");
  });

  it("never emits HowTo, which Google no longer shows", () => {
    expect(JSON.stringify(guideStructuredData(guide, { description: "d", trail }))).not.toContain("HowTo");
  });
});

describe("collection structured data", () => {
  it("lists every guide with a position", () => {
    const graph = collectionStructuredData({
      name: "Vehicles guides",
      description: "d",
      path: "/guides/vehicles",
      trail: trail.slice(0, 3),
      guides: [{ slug: "a", title: "A" }, { slug: "b", title: "B" }],
    })["@graph"];
    const list = (graph[0] as { mainEntity: { numberOfItems: number; itemListElement: { position: number }[] } }).mainEntity;
    expect(list.numberOfItems).toBe(2);
    expect(list.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });
});

describe("jsonLd", () => {
  it("escapes a less-than sign so a value cannot close the script tag", () => {
    const out = jsonLd({ headline: "</script><b>x" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).headline).toBe("</script><b>x");
  });
});
