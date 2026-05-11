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
  readonly body: string | undefined;
};

export function createResponseProxy(
  caidoRes?: Response,
): ResponseProxy | undefined {
  if (caidoRes === undefined) return undefined;

  let parser: ResponseParser;
  try {
    parser = new ResponseParser(caidoRes.getRaw().toText());
  } catch {
    return {
      get statusCode() {
        return caidoRes.getCode();
      },
      get duration() {
        return caidoRes.getRoundtripTime();
      },
      get headers() {
        return {
          raw: [] as [string, string][],
          get: () => undefined,
          has: () => false,
        };
      },
      get body() {
        return caidoRes.getBody()?.toText();
      },
    };
  }

  return {
    get statusCode() {
      return caidoRes.getCode();
    },
    get duration() {
      return caidoRes.getRoundtripTime();
    },
    get headers() {
      return {
        raw: parser.headers.raw,
        get: (name: string) => parser.headers.get(name),
        has: (name: string) => parser.headers.has(name),
      };
    },
    get body() {
      return caidoRes.getBody()?.toText();
    },
  };
}
