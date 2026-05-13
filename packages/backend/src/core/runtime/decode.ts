export type DecodeOptions = {
  strict?: boolean;
};

export function decode(
  input: string,
  method: string,
  options?: DecodeOptions,
): string {
  switch (method) {
    case "url": {
      if (options?.strict === true) {
        return decodeURIComponent(input);
      }
      return decodeURI(input);
    }
    default:
      throw new Error(`Unsupported decoding method: "${method}"`);
  }
}
