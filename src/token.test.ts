import { createDataItemSigner } from "@permaweb/aoconnect";
import Token, { type TokenInstance } from "./Token";
import Arweave from "arweave";

describe("Token testing", () => {
  let token: TokenInstance;

  beforeAll(async () => {
    const arweave = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https"
    });
    token = await Token(
      "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc",
      createDataItemSigner(await arweave.wallets.generate())
    );
  });

  test("Load token", () => {
    expect(token).not.toBeUndefined();
    expect(token.info).not.toBeUndefined();
    expect(typeof token.info?.Name).toBe("string");
  });
});
