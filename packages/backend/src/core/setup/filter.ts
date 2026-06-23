const JS_EXTENSIONS = ["js", "mjs", "cjs"];

const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "svg",
  "ico",
  "webp",
  "bmp",
];

const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "avi", "mkv", "flv", "wmv"];

const DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "rtf",
  "odt",
  "ods",
];

const STYLING_EXTENSIONS = ["css", "woff", "woff2", "ttf", "eot"];

type TimeFilter = "all" | "recent" | "1hr" | "6hr" | "12hr" | "24hr";

function getTimeCutoff(filter: TimeFilter): number | undefined {
  const now = Date.now();
  switch (filter) {
    case "recent":
      return now - 30 * 60 * 1000;
    case "1hr":
      return now - 60 * 60 * 1000;
    case "6hr":
      return now - 6 * 60 * 60 * 1000;
    case "12hr":
      return now - 12 * 60 * 60 * 1000;
    case "24hr":
      return now - 24 * 60 * 60 * 1000;
    default:
      return undefined;
  }
}

export function buildFilter(
  filter: string,
  options?: {
    noJavascript?: boolean;
    noImages?: boolean;
    noVideos?: boolean;
    noDocuments?: boolean;
    noStyling?: boolean;
    timeFilter?: TimeFilter;
  },
): string {
  let httpql = filter.trim().length > 0 ? filter : 'source:"intercept"';

  const extensions: string[] = [];
  if (options?.noJavascript === true) extensions.push(...JS_EXTENSIONS);
  if (options?.noImages === true) extensions.push(...IMAGE_EXTENSIONS);
  if (options?.noVideos === true) extensions.push(...VIDEO_EXTENSIONS);
  if (options?.noDocuments === true) extensions.push(...DOCUMENT_EXTENSIONS);
  if (options?.noStyling === true) extensions.push(...STYLING_EXTENSIONS);

  if (extensions.length > 0) {
    const extClauses = extensions
      .map((ext) => `req.ext.nlike:"%.${ext}"`)
      .join(" AND ");
    httpql = `(${httpql}) AND (${extClauses})`;
  }

  const timeCutoff = getTimeCutoff(options?.timeFilter ?? "all");
  if (timeCutoff !== undefined) {
    httpql = `(${httpql}) AND (req.created_at.gt:"${new Date(timeCutoff).toISOString()}")`;
  }

  return httpql;
}
