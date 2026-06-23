import type { SDK } from "caido:plugin";
import { RequestSpec, RequestSpecRaw, type Response } from "caido:utils";

export type SendRequestResult =
  | {
      kind: "Ok";
      requestId: string;
      response: Response;
    }
  | {
      kind: "Error";
      error: string;
    };

export const sendHttpRequest = async (
  sdk: SDK,
  host: string,
  port: number,
  tls: boolean,
  raw: string,
  timeoutMs?: number,
): Promise<SendRequestResult> => {
  try {
    let spec: RequestSpec | RequestSpecRaw;
    try {
      spec = RequestSpec.parse(raw);
    } catch {
      const specRaw = new RequestSpecRaw(`${tls ? "https" : "http"}://${host}`);
      specRaw.setRaw(raw);
      spec = specRaw;
    }
    spec.setPort(port);
    spec.setTls(tls);

    const sent = await sdk.requests.send(
      spec,
      timeoutMs !== undefined && timeoutMs > 0
        ? { timeouts: timeoutMs }
        : undefined,
    );
    return {
      kind: "Ok",
      requestId: sent.request.getId(),
      response: sent.response,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    sdk.console.log(`sendHttpRequest error: ${msg}`);
    return {
      kind: "Error",
      error: msg,
    };
  }
};
