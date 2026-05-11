import type { SDK } from "caido:plugin";

export type CallbackHit = {
  timestamp: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
};

export type SpawnedCallback = {
  url: string;
  waitForHit: (opts?: { timeout?: number }) => Promise<CallbackHit | undefined>;
};

// eslint-disable-next-line @typescript-eslint/require-await
export async function spawnCallback(_sdk: SDK): Promise<SpawnedCallback> {
  // TODO: implement callback listener (e.g., via ngrok, interactsh, or local HTTP server)
  return {
    url: "https://example.com/callback",
    // eslint-disable-next-line @typescript-eslint/require-await
    waitForHit: async () => undefined,
  };
}
