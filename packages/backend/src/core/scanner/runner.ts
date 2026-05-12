import type { SDK } from "caido:plugin";

import { BackendEvent, type CheckRule, type PluginEvents } from "../../types";

import { executeCheck } from "./executor";
import { RequestPool } from "./pool";

const activePools = new Map<number, RequestPool>();

export function getActivePool(sessionId: number): RequestPool | undefined {
  return activePools.get(sessionId);
}

export const runScan = async (
  sdk: SDK<Record<string, never>, PluginEvents>,
  sessionId: number,
  requestIds: string[],
  checks: CheckRule[],
  threads: number,
  delayMs: number,
  timeoutSec: number,
): Promise<void> => {
  if (checks.length === 0 || requestIds.length === 0) return;

  const pool = new RequestPool(sdk, threads, delayMs, timeoutSec * 1000);
  activePools.set(sessionId, pool);
  const promises: Promise<void>[] = [];

  try {
    for (const requestId of requestIds) {
      const rawRequest = await sdk.requests.get(requestId);
      if (rawRequest === undefined) continue;

      for (const check of checks) {
        promises.push(executeCheck(sdk, sessionId, rawRequest, check, pool));
      }
    }

    // eslint-disable-next-line compat/compat
    await Promise.allSettled(promises);

    const idleTimeoutMs = 60_000;
    // eslint-disable-next-line compat/compat
    await Promise.race([
      pool.waitUntilIdle(),
      // eslint-disable-next-line compat/compat
      new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("Pool idle timeout")), idleTimeoutMs);
      }),
    ]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sdk.console.log(`Scan error: ${message}`);
  } finally {
    activePools.delete(sessionId);
    sdk.api.send(BackendEvent.ScanComplete, { sessionId });
  }
};
