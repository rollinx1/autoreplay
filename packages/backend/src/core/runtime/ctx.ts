import type { SDK } from "caido:plugin";

import { insertScanResult } from "../../database/mutation";
import { getResource } from "../../database/query";
import { type CheckRule, type PluginEvents } from "../../types";
import { type SendRequestResult } from "../scanner/http";

import { decode } from "./decode";
import { encode } from "./encode";
import { notifyDiscord } from "./notify";
import { type RequestProxy } from "./request";
import { createResponseProxy, type ResponseProxy } from "./response";
import { utils } from "./utils";

export type RuntimeSendResult =
  | {
      kind: "Ok";
      requestId: string;
      response: ResponseProxy;
    }
  | {
      kind: "Error";
      error: string;
    };

export type RuntimeContext = {
  send: (req: RequestProxy) => Promise<RuntimeSendResult>;
  notify: {
    discord: (
      identifier: string,
    ) => Promise<{ message: (text: string) => Promise<void> }>;
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
  isStopped: () => boolean,
): RuntimeContext {
  return {
    send: async (req) => {
      const method = req.method;
      const host = req.headers.get("host") ?? req.host;
      const path = req.path.segments.join("/") || "/";
      const query = req.query.raw;

      let result: SendRequestResult;
      try {
        result = await enqueue(req);
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        sdk.console.log(`Send error: ${error}`);
        return { kind: "Error", error };
      }

      if (isStopped()) {
        return { kind: "Error", error: "Scan stopped" };
      }

      if (result.kind === "Error") {
        try {
          await insertScanResult(sdk, {
            sessionId,
            originalRequestId: requestId,
            checkId: check.id,
            checkName: check.name,
            method,
            host,
            path,
            query,
            status: "error",
            size: 0,
            duration: 0,
          });
        } catch (err) {
          sdk.console.log(
            `Scan result error: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
        return result;
      }

      const response = createResponseProxy(result.response);

      try {
        await insertScanResult(sdk, {
          sessionId,
          originalRequestId: requestId,
          checkId: check.id,
          checkName: check.name,
          method,
          host,
          path,
          query,
          status: "success",
          statusCode: result.response.getCode(),
          size: result.response.getBody()?.toRaw().length ?? 0,
          modifiedRequestId: result.requestId,
          duration: result.response.getRoundtripTime(),
        });
      } catch (err) {
        sdk.console.log(
          `Scan result error: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      return {
        kind: "Ok",
        requestId: result.requestId,
        response,
      };
    },
    notify: {
      discord: async (identifier) => {
        const row = await getResource(sdk, "discord", identifier);
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
    list: async (identifier) => {
      const row = await getResource(sdk, "list", identifier);
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
