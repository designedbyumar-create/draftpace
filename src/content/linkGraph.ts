import { blockBodyStrings } from "./guideText";
import { GUIDES, SERIES, type Guide, type GuideBlock } from "./guides";
import { LIFE_AREAS } from "./areas";

/**
 * The whole guides layer as one graph, so a check can ask questions no
 * single guide's own data can answer: is anything only reachable from
 * one place, does a guide's writing ever point a reader sideways into a
 * neighbour rather than only down to the footer block, is a link ever
 * spent twice on the same target when it could have reached a different
 * guide.
 *
 * Nodes are guide slugs plus each populated area's hub ("hub:<area>").
 * Edges come from four real, on-page sources: the curated `next` and
 * `related` fields, an inline `[text](/guides/...)` link inside the
 * body copy, and the hub, which every guide links back to via its
 * breadcrumb and "All N ... guides" link, and which itself links every
 * guide filed under it. A body link is the one source that costs the
 * writer something: it has to read naturally inside a sentence, so
 * counting it separately (`bodyLinks`) is what tells a footer-only
 * guide apart from one that actually weaves its neighbours into the
 * prose.
 */

export type LinkGraphNode = { id: string; kind: "guide" | "hub"; areaSlug: string | null };
export type LinkGraphEdge = { from: string; to: string; via: "next" | "related" | "body" | "hub-lists-guide" | "guide-links-hub" };

const HREF = /\[[^\]]*\]\(([^)\s]+)\)/g;

/** Every relative href a block's body copy links to, in appearance order, duplicates kept. */
export function inlineHrefs(block: GuideBlock): string[] {
  const hrefs: string[] = [];
  for (const text of blockBodyStrings(block)) {
    for (const m of text.matchAll(HREF)) hrefs.push(m[1]);
  }
  return hrefs;
}

/** The guide slugs a guide's body copy links to inline, deduplicated. */
export function bodyLinkedGuideSlugs(guide: Guide): string[] {
  const targets = new Set<string>();
  for (const block of guide.body) {
    for (const href of inlineHrefs(block)) {
      const m = /^\/guides\/([a-z0-9-]+)$/.exec(href);
      if (m) targets.add(m[1]);
    }
  }
  return [...targets];
}

/**
 * `buildLinkGraph` only ever adds an edge for a target it can find, the
 * same way a `<Link>` would still render even if the route behind it
 * were gone. That makes a typo'd slug invisible in the edge list, so
 * this collects every dangling target buildLinkGraph quietly dropped,
 * which is the thing linkGraph.test.ts actually needs to assert on.
 */
export function danglingLinks(): { from: string; to: string; via: "next" | "related" | "body" }[] {
  const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));
  const dangling: { from: string; to: string; via: "next" | "related" | "body" }[] = [];
  for (const g of GUIDES) {
    if (g.next && !bySlug.has(g.next.slug)) dangling.push({ from: g.slug, to: g.next.slug, via: "next" });
    for (const r of g.related ?? []) if (!bySlug.has(r.slug)) dangling.push({ from: g.slug, to: r.slug, via: "related" });
    for (const target of bodyLinkedGuideSlugs(g)) if (target !== g.slug && !bySlug.has(target)) dangling.push({ from: g.slug, to: target, via: "body" });
  }
  return dangling;
}

export function buildLinkGraph(): { nodes: LinkGraphNode[]; edges: LinkGraphEdge[] } {
  const nodes: LinkGraphNode[] = [];
  const edges: LinkGraphEdge[] = [];
  const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));

  for (const g of GUIDES) nodes.push({ id: g.slug, kind: "guide", areaSlug: g.areaSlug });
  for (const area of LIFE_AREAS) {
    if (!GUIDES.some((g) => g.areaSlug === area.slug)) continue;
    nodes.push({ id: `hub:${area.slug}`, kind: "hub", areaSlug: area.slug });
  }

  for (const g of GUIDES) {
    if (g.next && bySlug.has(g.next.slug)) edges.push({ from: g.slug, to: g.next.slug, via: "next" });
    for (const r of g.related ?? []) if (bySlug.has(r.slug)) edges.push({ from: g.slug, to: r.slug, via: "related" });
    for (const target of bodyLinkedGuideSlugs(g)) if (bySlug.has(target) && target !== g.slug) edges.push({ from: g.slug, to: target, via: "body" });

    if (g.areaSlug && g.areaSlug !== SERIES) {
      edges.push({ from: `hub:${g.areaSlug}`, to: g.slug, via: "hub-lists-guide" });
      edges.push({ from: g.slug, to: `hub:${g.areaSlug}`, via: "guide-links-hub" });
    }
  }
  return { nodes, edges };
}

export type GuideLinkStats = {
  slug: string;
  areaSlug: string | null;
  inbound: number;
  inboundBody: number;
  outboundBody: number;
  distinctOutboundTargets: number;
  crossAreaOutbound: number;
};

export type LinkGraphReport = {
  nodeCount: number;
  edgeCount: number;
  orphans: string[];
  noBodyLinks: string[];
  lowDiversity: { slug: string; targets: string[] }[];
  crossAreaEdges: number;
  perGuide: GuideLinkStats[];
};

/**
 * The soft findings a link-graph check surfaces: not "broken", but worth
 * a look before the next content wave. Everything here is informational;
 * see linkGraph.test.ts for which of it is a hard assertion today.
 */
export function linkGraphReport(): LinkGraphReport {
  const { nodes, edges } = buildLinkGraph();
  const areaOf = new Map(GUIDES.map((g) => [g.slug, g.areaSlug]));

  const inbound = new Map<string, number>();
  const inboundBody = new Map<string, number>();
  const outboundBody = new Map<string, Set<string>>();
  const outboundAll = new Map<string, Set<string>>();
  let crossAreaEdges = 0;

  for (const n of nodes) {
    inbound.set(n.id, 0);
    inboundBody.set(n.id, 0);
    outboundBody.set(n.id, new Set());
    outboundAll.set(n.id, new Set());
  }
  for (const e of edges) {
    inbound.set(e.to, (inbound.get(e.to) ?? 0) + 1);
    outboundAll.get(e.from)?.add(e.to);
    if (e.via === "body") {
      inboundBody.set(e.to, (inboundBody.get(e.to) ?? 0) + 1);
      outboundBody.get(e.from)?.add(e.to);
    }
    if ((e.via === "next" || e.via === "related") && areaOf.get(e.from) && areaOf.get(e.to) && areaOf.get(e.from) !== areaOf.get(e.to)) {
      crossAreaEdges++;
    }
  }

  const guideNodes = nodes.filter((n) => n.kind === "guide");
  const orphans = guideNodes.filter((n) => (inbound.get(n.id) ?? 0) === 0).map((n) => n.id);
  const noBodyLinks = guideNodes.filter((n) => (outboundBody.get(n.id)?.size ?? 0) === 0).map((n) => n.id);
  const lowDiversity = guideNodes
    .filter((n) => (outboundAll.get(n.id)?.size ?? 0) <= 2)
    .map((n) => ({ slug: n.id, targets: [...(outboundAll.get(n.id) ?? [])] }));

  const perGuide: GuideLinkStats[] = guideNodes.map((n) => ({
    slug: n.id,
    areaSlug: n.areaSlug,
    inbound: inbound.get(n.id) ?? 0,
    inboundBody: inboundBody.get(n.id) ?? 0,
    outboundBody: outboundBody.get(n.id)?.size ?? 0,
    distinctOutboundTargets: outboundAll.get(n.id)?.size ?? 0,
    crossAreaOutbound: 0,
  }));

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    orphans,
    noBodyLinks,
    lowDiversity,
    crossAreaEdges,
    perGuide,
  };
}
