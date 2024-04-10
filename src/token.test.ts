import Token from "./Token";

describe("Token testing", () => {
  let token: Token;

  beforeAll(async () => {
    token = await Token.load("Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc");
  });

  test("Load token", () => {
    expect(token).not.toBeUndefined();
    expect(token.info).not.toBeUndefined();
    expect(typeof token.info?.Name).toBe("string");
  });
});
