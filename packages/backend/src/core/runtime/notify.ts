import { Blob, fetch } from "caido:http";

type NotifyOptions = {
  webhookUrl: string;
  message: string;
};

export async function notifyDiscord(opts: NotifyOptions): Promise<void> {
  const res = await fetch(opts.webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "AutoReplay/1.0",
    },
    body: new Blob([
      JSON.stringify({
        embeds: [
          {
            description: opts.message,
            color: 3447003,
          },
        ],
      }),
    ]),
  });

  if (!res.ok) {
    throw new Error(`Discord notify failed: ${res.status}`);
  }
}
