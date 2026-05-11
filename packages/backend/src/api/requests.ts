import type { SDK } from "caido:plugin";

import type { HttpRequest, Result } from "../types";

export const getSetupRequests = async (
  sdk: SDK,
  filter: string,
): Promise<Result<HttpRequest[]>> => {
  try {
    const fullFilter = filter.trim().length > 0 ? filter : 'source:"intercept"';
    const results = await sdk.requests.query().filter(fullFilter).execute();

    const requests: HttpRequest[] = results.items.map((item) => ({
      id: item.request.getId(),
      method: item.request.getMethod(),
      url: item.request.getUrl(),
      path: item.request.getPath(),
      query: item.request.getQuery(),
      host: item.request.getHost(),
      capturedAt: item.request.getCreatedAt().toISOString(),
    }));

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
