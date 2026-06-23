import { RequestParser } from "@caido-utils/parser";
import type { Request } from "caido:utils";

export function createDeduplicationKey(request: Request): string {
  const raw = request.getRaw().toText();
  const parser = new RequestParser(raw);
  const method = request.getMethod();
  const host = request.getHost();
  const path = request.getPath();
  const cookie = parser.headers.get("Cookie") ?? "";
  const queryNames = parser.query.items
    .map((p) => p.name)
    .sort()
    .join(",");
  return `${method}|${host}|${path}|${queryNames}|${cookie}`;
}
