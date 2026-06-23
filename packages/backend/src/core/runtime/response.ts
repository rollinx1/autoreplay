import { ResponseParser } from "@caido-utils/parser";
import type { Response } from "caido:utils";

export type ResponseProxy = {
  readonly statusCode: number;
  readonly duration: number;
  readonly headers: {
    readonly raw: [string, string][];
    get(name: string): string | undefined;
    has(name: string): boolean;
  };
  readonly body: ResponseParser["body"] | undefined;
};

export function createResponseProxy(caidoRes: Response): ResponseProxy;
export function createResponseProxy(
  caidoRes?: Response,
): ResponseProxy | undefined;
export function createResponseProxy(
  caidoRes?: Response,
): ResponseProxy | undefined {
  if (caidoRes === undefined) return undefined;

  let parser: ResponseParser | undefined;
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
      const p = getParser();
      return p === undefined ? undefined : p.body;
    },
  };
}
