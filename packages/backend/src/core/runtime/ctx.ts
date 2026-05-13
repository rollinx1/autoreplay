import type { SDK } from "caido:plugin";

import { insertScanResult } from "../../database/mutation";
import { getSetting } from "../../database/query";
import { type CheckRule, type PluginEvents } from "../../types";
import { type SendRequestResult } from "../scanner/http";

import { decode } from "./decode";
import { encode } from "./encode";
import { notifyDiscord } from "./notify";
import { type RequestProxy } from "./request";
import { utils } from "./utils";

export type RuntimeContext = {
  send: (req: RequestProxy) => Promise<void>;
  notify: {
    discord: (
      identifier: string,
    ) => Promise<{ message: (text: string) => Promise<void> }>;
  };
  callback: {
    spawn: () => Promise<{
      url: string;
      waitForHit: (opts?: { timeout?: number }) => Promise<unknown>;
    }>;
  };
  list: (identifier: string) => Promise<string[]>;
  utils: typeof utils;
  encode: typeof encode;
  decode: typeof decode;
};

export function createContext(
  sdk: SDK<Record<string, never>, PluginEvents>,
  sessionId: number,
  requestId: string,
  check: CheckRule,
  enqueue: (req: RequestProxy) => Promise<SendRequestResult>,
): RuntimeContext {
  return {
    // eslint-disable-next-line @typescript-eslint/require-await
    send: async (req) => {
      const method = req.method;
      const host = req.headers.get("host") ?? req.host;
      const path = req.path.segments.join("/") || "/";
      const query = req.query.raw;

      void enqueue(req)
        .then(
          async ({
            statusCode,
            size,
            requestId: modifiedRequestId,
            duration,
          }) => {
            await insertScanResult(sdk, {
              sessionId,
              originalRequestId: requestId,
              checkId: check.id,
              checkName: check.name,
              method,
              host,
              path,
              query,
              status: statusCode > 0 ? "success" : "error",
              statusCode: statusCode > 0 ? statusCode : undefined,
              size,
              modifiedRequestId,
              duration,
            });
          },
        )
        .catch((err: unknown) => {
          sdk.console.log(
            `Send error: ${err instanceof Error ? err.message : String(err)}`,
          );
        });
    },
    notify: {
      discord: async (identifier) => {
        const row = await getSetting(sdk, "discord", identifier);
        if (row === undefined) {
          throw new Error(`Discord webhook "${identifier}" not found`);
        }
        const parsed = JSON.parse(row.data) as { url: string };
        return {
          message: async (text: string) => {
            try {
              await notifyDiscord({ webhookUrl: parsed.url, message: text });
            } catch (err) {
              sdk.console.log(
                `Discord notify error: ${err instanceof Error ? err.message : String(err)}`,
              );
            }
          },
        };
      },
    },
    callback: {
      // eslint-disable-next-line @typescript-eslint/require-await
      spawn: async () => {
        return {
          url: "https://example.com/callback",
          // eslint-disable-next-line @typescript-eslint/require-await
          waitForHit: async () => undefined,
        };
      },
    },
    list: async (identifier) => {
      const row = await getSetting(sdk, "list", identifier);
      if (row === undefined) {
        throw new Error(`Payload list "${identifier}" not found`);
      }
      const parsed = JSON.parse(row.data) as { items: string[] };
      return parsed.items;
    },
    utils,
    encode,
    decode,
  };
}
