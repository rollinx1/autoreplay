export type EncodeOptions = {
  strict?: boolean;
};

export function encode(
  input: string,
  method: string,
  options?: EncodeOptions,
): string {
  switch (method) {
    case "url": {
      if (options?.strict === true) {
        return encodeURIComponent(input);
      }
      return encodeURI(input);
    }
    default:
      throw new Error(`Unsupported encoding method: "${method}"`);
  }
}
