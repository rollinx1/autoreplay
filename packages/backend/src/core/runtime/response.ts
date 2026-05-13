import { ResponseParser } from "@caido-utils/parser";
import type { Response } from "caido:utils";

type BodyProxy = {
  readonly type: string | undefined;
  readonly items: { name: string; value: unknown }[];
  get(name: string): unknown;
  has(name: string): boolean;
  set(name: string, value: unknown): void;
  remove(name: string): void;
};

export type ResponseProxy = {
  readonly statusCode: number;
  readonly duration: number;
  readonly headers: {
    readonly raw: [string, string][];
    get(name: string): string | undefined;
    has(name: string): boolean;
  };
  readonly body: BodyProxy | undefined;
};

export function createResponseProxy(
  caidoRes?: Response,
): ResponseProxy | undefined {
  if (caidoRes === undefined) return undefined;

  let parser: ResponseParser | undefined;
  let bodyProxy: BodyProxy | undefined;
  let parseFailed = false;

  const getParser = (): ResponseParser | undefined => {
    if (parseFailed) return undefined;
    if (parser === undefined) {
      try {
        parser = new ResponseParser(caidoRes.getRaw().toText());
      } catch {
        parseFailed = true;
        return undefined;
      }
    }
    return parser;
  };

  const getBodyProxy = (): BodyProxy | undefined => {
    const p = getParser();
    if (p === undefined || p.body === undefined) return undefined;
    if (bodyProxy === undefined) {
      bodyProxy = {
        get type() {
          return p.body!.type;
        },
        get items() {
          return p.body!.items;
        },
        get: (name: string) => p.body!.get(name),
        has: (name: string) => p.body!.has(name),
        set: (name: string, value: string) => p.body!.set(name, value),
        remove: (name: string) => p.body!.remove(name),
      };
    }
    return bodyProxy;
  };

  const emptyHeaders = {
    raw: [] as [string, string][],
    get: (): string | undefined => undefined,
    has: (): boolean => false,
  };

  return {
    get statusCode() {
      return caidoRes.getCode();
    },
    get duration() {
      return caidoRes.getRoundtripTime();
    },
    get headers() {
      const p = getParser();
      if (p === undefined) return emptyHeaders;
      return {
        raw: p.headers.raw,
        get: (name: string) => p.headers.get(name),
        has: (name: string) => p.headers.has(name),
      };
    },
    get body() {
      return getBodyProxy();
    },
  };
}
