import { RequestParser } from "@caido-utils/parser";
import type { SDK } from "caido:plugin";

import type { HttpRequest, Result } from "../types";

export const getSetupRequests = async (
  sdk: SDK,
  filter: string,
  deduplicate = false,
): Promise<Result<HttpRequest[]>> => {
  try {
    const fullFilter = filter.trim().length > 0 ? filter : 'source:"intercept"';
    const results = await sdk.requests.query().filter(fullFilter).execute();

    const seen = new Set<string>();
    const requests: HttpRequest[] = [];

    for (const item of results.items) {
      const req = item.request;
      const method = req.getMethod();
      const host = req.getHost();
      const path = req.getPath();
      const query = req.getQuery();

      const id = req.getId();
      const url = req.getUrl();
      const capturedAt = req.getCreatedAt().toISOString();

      if (deduplicate) {
        const raw = req.getRaw().toText();
        const parser = new RequestParser(raw);
        const cookie = parser.headers.get("Cookie") ?? "";
        const key = `${method}|${host}|${path}|${query}|${cookie}`;

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
        query,
        host,
        capturedAt,
      });
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
