import type { SDK } from "caido:plugin";

import { buildFilter, createDeduplicationKey } from "../core/setup";
import type { HttpRequest, Result } from "../types";

const PAGE_SIZE = 1000;
const SCAN_COOKIE_NAME = "__areplay";

const buildScanRequestsFilter = (filter: string, tag: string): string => {
  const tagFilter = `req.raw.cont:"${SCAN_COOKIE_NAME}=${tag}"`;
  const userFilter = filter.trim();

  if (userFilter.length === 0) {
    return tagFilter;
  }

  return `(${tagFilter}) AND (${userFilter})`;
};

export const getSetupRequests = async (
  sdk: SDK,
  filter: string,
  options?: {
    deduplicate?: boolean;
    inScope?: boolean;
    noJavascript?: boolean;
    noImages?: boolean;
    noVideos?: boolean;
    noDocuments?: boolean;
    noStyling?: boolean;
    timeFilter?: "all" | "recent" | "1hr" | "6hr" | "12hr" | "24hr";
  },
): Promise<Result<HttpRequest[]>> => {
  try {
    const userFilter = filter.trim();
    const setupFilter =
      userFilter.length > 0
        ? `(source:"intercept") AND (${userFilter})`
        : 'source:"intercept"';
    const fullFilter = buildFilter(setupFilter, options);
    const deduplicate = options?.deduplicate ?? false;
    const inScope = options?.inScope ?? true;

    const seen = new Set<string>();
    const requests: HttpRequest[] = [];
    let cursor: string | undefined;

    while (true) {
      let query = sdk.requests.query().filter(fullFilter).first(PAGE_SIZE);

      if (cursor !== undefined) {
        query = query.after(cursor);
      }

      const results = await query.execute();

      for (const item of results.items) {
        const req = item.request;

        if (inScope && !sdk.requests.inScope(req)) {
          continue;
        }

        const method = req.getMethod();
        const host = req.getHost();
        const path = req.getPath();
        const queryStr = req.getQuery();

        const id = req.getId();
        const url = req.getUrl();
        const capturedAt = req.getCreatedAt().toISOString();

        if (deduplicate) {
          const key = createDeduplicationKey(req);

          if (seen.has(key)) {
            continue;
          }
          seen.add(key);
        }

        requests.push({
          id,
          method,
          url,
          path,
          query: queryStr,
          host,
          capturedAt,
        });
      }

      if (!results.pageInfo.hasNextPage) {
        break;
      }

      cursor = results.pageInfo.endCursor;
    }

    return { kind: "Ok", value: requests };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export const getFilteredRequests = async (
  sdk: SDK,
  filter: string,
  tag: string,
): Promise<Result<HttpRequest[]>> => {
  try {
    if (tag.trim().length === 0) {
      return { kind: "Error", error: "Scan tag is required" };
    }

    const fullFilter = buildScanRequestsFilter(filter, tag);
    const requests: HttpRequest[] = [];
    let cursor: string | undefined;

    while (true) {
      let query = sdk.requests.query().filter(fullFilter).first(PAGE_SIZE);

      if (cursor !== undefined) {
        query = query.after(cursor);
      }

      const results = await query.execute();

      for (const item of results.items) {
        const req = item.request;
        requests.push({
          id: req.getId(),
          method: req.getMethod(),
          url: req.getUrl(),
          path: req.getPath(),
          query: req.getQuery(),
          host: req.getHost(),
          capturedAt: req.getCreatedAt().toISOString(),
        });
      }

      if (!results.pageInfo.hasNextPage) {
        break;
      }

      cursor = results.pageInfo.endCursor;
    }

    return { kind: "Ok", value: requests };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};

export async function getRequestResponse(
  sdk: SDK,
  requestId: string,
): Promise<{ rawRequest?: string; rawResponse?: string } | undefined> {
  const stored = await sdk.requests.get(requestId);
  if (stored === undefined) return undefined;

  return {
    rawRequest: stored.request.getRaw().toText(),
    rawResponse: stored.response?.getRaw().toText(),
  };
}

export const getRequestsByIds = async (
  sdk: SDK,
  ids: string[],
): Promise<Result<HttpRequest[]>> => {
  try {
    const requests: HttpRequest[] = [];
    for (const id of ids) {
      const stored = await sdk.requests.get(id);
      if (stored === undefined) continue;
      const req = stored.request;
      requests.push({
        id: req.getId(),
        method: req.getMethod(),
        url: req.getUrl(),
        path: req.getPath(),
        query: req.getQuery(),
        host: req.getHost(),
        capturedAt: req.getCreatedAt().toISOString(),
      });
    }
    return { kind: "Ok", value: requests };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { kind: "Error", error: message };
  }
};
