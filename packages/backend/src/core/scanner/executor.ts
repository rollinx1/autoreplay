import type { SDK } from "caido:plugin";
import type { RequestResponseOpt } from "caido:utils";

import type { CheckRule, PluginEvents } from "../../types";
import { createContext, createRequestProxy } from "../runtime";
import { createResponseProxy } from "../runtime/response";

import { type RequestPool } from "./pool";

export const executeCheck = async (
  sdk: SDK<Record<string, never>, PluginEvents>,
  sessionId: number,
  rawRequest: RequestResponseOpt,
  check: CheckRule,
  pool: RequestPool,
): Promise<void> => {
  const request = rawRequest.request;
  const response = rawRequest.response;
  const requestId = request.getId();

  const { send, notify, callback, list, utils } = createContext(
    sdk,
    sessionId,
    requestId,
    check,
    pool.enqueue,
  );

  const requestProxy = createRequestProxy(request);
  const responseProxy = createResponseProxy(response);

  let fn: (...args: unknown[]) => unknown;
  try {
    fn = new Function(
      "request",
      "response",
      "send",
      "notify",
      "callback",
      "urlEncode",
      "urlDecode",
      "random",
      "list",
      `return (async () => { ${check.code} })()`,
    ) as (...args: unknown[]) => unknown;
  } catch (err) {
    sdk.console.log(
      `Check syntax error: ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }

  try {
    await fn(
      requestProxy,
      responseProxy,
      send,
      notify,
      callback,
      utils.urlEncode,
      utils.urlDecode,
      utils.random,
      list,
    );
  } catch (err) {
    sdk.console.log(
      `Check runtime error: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  }
};
