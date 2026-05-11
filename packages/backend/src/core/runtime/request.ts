import { RequestParser } from "@caido-utils/parser";
import type { Request } from "caido:utils";

export type RequestProxy = RequestParser & {
  readonly raw: string;
  readonly id: string;
  readonly url: string;
  readonly host: string;
  readonly capturedAt: string;
};

export function createRequestProxy(caidoReq: Request): RequestProxy {
  const parser = new RequestParser(caidoReq.getRaw().toText());
  return new Proxy(parser, {
    get(target, prop) {
      if (prop === "raw") return target.build();
      if (prop === "id") return caidoReq.getId();
      if (prop === "url") return caidoReq.getUrl();
      if (prop === "capturedAt") return caidoReq.getCreatedAt().toISOString();
      if (prop === "host") {
        return target.headers.get("host") ?? caidoReq.getHost();
      }

      const val = (target as unknown as Record<string | symbol, unknown>)[prop];
      return typeof val === "function" ? val.bind(target) : val;
    },
  }) as RequestProxy;
}
