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

  const { send, notify, callback, list, utils, encode, decode } = createContext(
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
      "encode",
      "decode",
      `return (async () => { ${check.code} })()`,
    ) as (...args: unknown[]) => unknown;
  } catch (err) {
    sdk.console.log(
      `Check syntax error: ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }

  const checkPromise = (async () => {
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
      encode,
      decode,
    );
  })();

  const timeoutMs = 120_000;
  // eslint-disable-next-line compat/compat
  const timeoutPromise = new Promise<void>((_, reject) => {
    const timer = setTimeout(
      () =>
        reject(
          new Error(`Check "${check.name}" timed out after ${timeoutMs}ms`),
        ),
      timeoutMs,
    );
    checkPromise
      .then(() => clearTimeout(timer))
      .catch(() => clearTimeout(timer));
  });

  try {
    // eslint-disable-next-line compat/compat
    await Promise.race([checkPromise, timeoutPromise]);
  } catch (err) {
    sdk.console.log(
      `Check error: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`,
    );
  }
};
