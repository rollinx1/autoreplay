import type { SDK } from "caido:plugin";
import { RequestSpecRaw } from "caido:utils";

export type SendRequestResult = {
  statusCode: number;
  size: number;
  requestId?: string;
  duration: number;
};

export const sendHttpRequest = async (
  sdk: SDK,
  host: string,
  raw: string,
  timeoutMs?: number,
): Promise<SendRequestResult> => {
  try {
    const spec = new RequestSpecRaw(`https://${host}`);
    spec.setRaw(raw);

    const sendPromise = sdk.requests.send(spec);
    let sent;
    if (timeoutMs !== undefined && timeoutMs > 0) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Request timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      });

      sent = await Promise.race([sendPromise, timeoutPromise]);
    } else {
      sent = await sendPromise;
    }
    const response = sent.response;

    if (response === undefined) {
      return {
        statusCode: 0,
        size: 0,
        requestId: sent.request?.getId(),
        duration: 0,
      };
    }

    return {
      statusCode: response.getCode(),
      size: response.getBody()?.toRaw().length ?? 0,
      requestId: sent.request?.getId(),
      duration: response.getRoundtripTime(),
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    sdk.console.log(`sendHttpRequest error: ${msg}`);
    return {
      statusCode: 0,
      size: 0,
      requestId: undefined,
      duration: 0,
    };
  }
};
