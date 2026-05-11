import type { RequestParser } from "@caido-utils/parser";
import type { SDK } from "caido:plugin";

import { sendHttpRequest, type SendRequestResult } from "./http";

type PoolItem = {
  raw: string;
  host: string;
  resolve: (result: SendRequestResult) => void;
  reject: (reason: unknown) => void;
};

type EnqueueFn = (request: RequestParser) => Promise<SendRequestResult>;

export class RequestPool {
  private queue: PoolItem[] = [];
  private active = 0;
  private lastSendTime = 0;
  private idleResolver: (() => void) | undefined = undefined;
  private paused = false;
  private stopped = false;

  constructor(
    private sdk: SDK,
    private concurrency: number,
    private delayMs: number,
    private timeoutMs: number,
  ) {}

  enqueue: EnqueueFn = (request) => {
    if (this.stopped) {
      return new Promise<never>((_, reject) => {
        reject(new Error("Scan stopped"));
      });
    }
    const host = request.headers.get("host") ?? "localhost";
    const raw = request.build();
    // eslint-disable-next-line compat/compat
    return new Promise((resolve, reject) => {
      this.queue.push({ raw, host, resolve, reject });
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

  private async drain() {
    while (
      this.queue.length > 0 &&
      this.active < this.concurrency &&
      !this.paused &&
      !this.stopped
    ) {
      const now = Date.now();
      const elapsed = now - this.lastSendTime;
      if (elapsed < this.delayMs) {
        await new Promise((r) => setTimeout(r, this.delayMs - elapsed));
      }

      const item = this.queue.shift()!;
      this.active++;
      this.lastSendTime = Date.now();

      sendHttpRequest(this.sdk, item.host, item.raw, this.timeoutMs)
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.active--;
          if (this.queue.length === 0 && this.active === 0) {
            this.idleResolver?.();
            this.idleResolver = undefined;
          }
          this.drain();
        });
    }
  }
}
