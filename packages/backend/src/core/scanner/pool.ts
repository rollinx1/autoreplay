import type { RequestParser } from "@caido-utils/parser";
import type { SDK } from "caido:plugin";

import type { RequestProxy } from "../runtime/request";

import { sendHttpRequest, type SendRequestResult } from "./http";

type PoolItem = {
  raw: string;
  host: string;
  port: number;
  tls: boolean;
  resolve: (result: SendRequestResult) => void;
  reject: (reason: unknown) => void;
};

type EnqueueFn = (
  request: RequestParser & Pick<RequestProxy, "port" | "tls">,
) => Promise<SendRequestResult>;

export class RequestPool {
  private queue: PoolItem[] = [];
  private active = 0;
  private idleResolver: (() => void) | undefined = undefined;
  private paused = false;
  private stopped = false;
  private nextRequestAt = 0;

  constructor(
    private sdk: SDK,
    private concurrency: number,
    private delayMs: number,
    private timeoutMs: number,
    private scanCookie: { name: string; value: string },
  ) {}

  enqueue: EnqueueFn = (request) => {
    if (this.stopped) {
      return new Promise<never>((_, reject) => {
        reject(new Error("Scan stopped"));
      });
    }
    request.cookies.set(this.scanCookie.name, this.scanCookie.value);
    const host = request.headers.get("host") ?? "localhost";
    const raw = request.build();
    // eslint-disable-next-line compat/compat
    return new Promise((resolve, reject) => {
      this.queue.push({
        raw,
        host,
        port: request.port,
        tls: request.tls,
        resolve,
        reject,
      });
      this.drain();
    });
  };

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.drain();
  }

  isStopped(): boolean {
    return this.stopped;
  }

  getState(): "running" | "paused" | "stopped" {
    if (this.stopped) return "stopped";
    if (this.paused) return "paused";
    return "running";
  }

  stop(): void {
    this.stopped = true;
    this.paused = false;
    for (const item of this.queue) {
      item.reject(new Error("Scan stopped"));
    }
    this.queue = [];
    if (this.active === 0) {
      this.idleResolver?.();
      this.idleResolver = undefined;
    }
  }

  waitUntilIdle(): Promise<void> {
    if (this.stopped || (this.queue.length === 0 && this.active === 0)) {
      return Promise.resolve();
    }
    // eslint-disable-next-line compat/compat
    return new Promise((resolve) => {
      this.idleResolver = resolve;
    });
  }

  private drain(): void {
    while (
      this.queue.length > 0 &&
      this.active < this.concurrency &&
      !this.paused &&
      !this.stopped
    ) {
      this.active++;
      void this.runWorker();
    }
  }

  private async runWorker(): Promise<void> {
    try {
      while (!this.paused && !this.stopped) {
        const item = this.queue.shift();
        if (item === undefined) break;

        const canSend = await this.waitForSendSlot();
        if (!canSend) {
          item.reject(new Error("Scan stopped"));
          break;
        }

        try {
          const result = await sendHttpRequest(
            this.sdk,
            item.host,
            item.port,
            item.tls,
            item.raw,
            this.timeoutMs,
          );
          item.resolve(result);
        } catch (err) {
          item.reject(err);
        }
      }
    } finally {
      this.active--;
      if (this.stopped || (this.queue.length === 0 && this.active === 0)) {
        this.idleResolver?.();
        this.idleResolver = undefined;
      }
      this.drain();
    }
  }

  private async waitForSendSlot(): Promise<boolean> {
    while (!this.stopped) {
      if (this.paused) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        continue;
      }

      const remainingMs = this.nextRequestAt - Date.now();
      if (remainingMs > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(remainingMs, 50)),
        );
        continue;
      }

      this.nextRequestAt = Date.now() + this.delayMs;
      return true;
    }

    return false;
  }
}
