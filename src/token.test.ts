import Token, { type TokenInstance } from "./Token";

describe("Token testing", () => {
  let token: TokenInstance;

  beforeAll(async () => {
    token = await Token("Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc");
  });

  test("Load token", () => {
    expect(token).not.toBeUndefined();
    expect(token.info).not.toBeUndefined();
    expect(typeof token.info?.Name).toBe("string");
  });
});
