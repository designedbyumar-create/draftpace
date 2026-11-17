import revisions from "./library.generated.json";
import info from "./library-info.generated.json";
import type { Guide } from "../guides";

export type ArticleDiagram = {
  title: string;
  kicker: string;
  kind: "sequence" | "compare" | "timeline" | "record";
  steps: { label: string; detail: string }[];
  caption: string;
  alt: string;
  src: string;
};
export type LibraryInfo = {
  printHref: string;
  worksheetTitle: string;
  worksheetPrompt: string;
  areaSlug: string | null;
  diagrams: ArticleDiagram[];
};
export const libraryRevisions = revisions as Record<string, Partial<Guide>>;
export const libraryInfo = info as Record<string, LibraryInfo>;
