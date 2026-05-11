const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const utils = {
  urlEncode: (input: string): string => encodeURIComponent(input),
  urlDecode: (input: string): string => decodeURIComponent(input),
  random: (length = 8): string => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return result;
  },
};
