export type PagefindSubResult = {
  url: string;
  title: string;
  excerpt: string;
  locations: number[];
  weighted_locations: number[];
};

export type PagefindPageData = {
  url: string;
  excerpt: string;
  title: string;
  meta: { title?: string };
  sub_results: PagefindSubResult[];
};

export type PagefindSearchResult = {
  data: () => Promise<PagefindPageData>;
};

export type PagefindSearch = {
  results: PagefindSearchResult[];
};

export type Pagefind = {
  search: (query: string) => Promise<PagefindSearch>;
};

export type SearchResult = {
  url: string;
  title: string;
  excerpt: string;
};

export type RankedEntry = {
  r: SearchResult;
  i: number;
  rank: number;
};

export const flattenResults = (page: PagefindPageData): SearchResult[] => {
  if (page.sub_results?.length) {
    return page.sub_results.map((sr) => ({
      url: sr.url,
      title: sr.title,
      excerpt: sr.excerpt,
    }));
  }
  return [
    {
      url: page.url,
      title: page.meta?.title || page.title || "Untitled",
      excerpt: page.excerpt,
    },
  ];
};

export const SECTION_ORDER: Record<string, number> = {
  guide: 0,
  api: 1,
  examples: 2,
};

export const escapeHtml = (text: string): string =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const toReadableSegment = (segment: string): string =>
  segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const getResultLocation = (
  url: string,
  base: string,
): { segments: string[]; hash: string } => {
  let pathname = url || "#";
  let hash = "";
  try {
    const parsed = new URL(url, window.location.origin);
    pathname = parsed.pathname;
    hash = parsed.hash;
  } catch {}
  if (base && pathname.startsWith(base))
    pathname = pathname.slice(base.length) || "/";
  pathname = pathname.replace(/\/index\.html$/, "");
  pathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return { segments: pathname.split("/").filter(Boolean), hash };
};

export const getSectionRank = (url: string, base: string): number => {
  const { segments } = getResultLocation(url, base);
  return (
    SECTION_ORDER[segments[0]?.toLowerCase() || ""] ?? Number.MAX_SAFE_INTEGER
  );
};

export const getResultMeta = (
  url: string,
  base: string,
): { section: string; path: string } => {
  const { segments, hash } = getResultLocation(url, base);
  const section = toReadableSegment(segments[0] || "docs");
  const trail = segments.slice(1).map(toReadableSegment);
  const path = trail.length > 0 ? trail.join(" / ") : "Overview";
  const hashLabel = hash
    ? ` \u00b7 ${toReadableSegment(hash.replace(/^#/, ""))}`
    : "";
  return { section, path: `${path}${hashLabel}` };
};

export const highlightText = (text: string, q: string): string => {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
};

export const getExcerpt = (raw: string, q: string): string | null => {
  const plain = String(raw)
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return null;
  return highlightText(plain, q);
};
