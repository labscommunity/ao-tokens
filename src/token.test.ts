import { createDataItemSigner } from "@permaweb/aoconnect";
import { JWKInterface } from "arweave/node/lib/wallet";
import Token, { type TokenInstance } from "./Token";
import Quantity from "./Quantity";
import Arweave from "arweave";

describe("Token testing", () => {
  let token: TokenInstance;
  let wallet: JWKInterface;

  beforeAll(async () => {
    const arweave = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https"
    });
    wallet = await arweave.wallets.generate();
    token = await Token(
      "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc",
      createDataItemSigner(wallet)
    );
  }, 12000);

  test("Load token", () => {
    expect(token).not.toBeUndefined();
    expect(token.info).not.toBeUndefined();
    expect(typeof token.info?.Name).toBe("string");
  });

  test("Quantity is of token", async () => {
    const tkn = await Token(
      "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc",
      createDataItemSigner(wallet)
    );
    const validQty = new Quantity(324n, 3n);
    const invalidQty = new Quantity(14529n, 5n);

    expect(Quantity.isQuantityOf(validQty, tkn)).toBeTruthy();
    expect(Quantity.isQuantityOf(invalidQty, tkn)).toBeFalsy();
  });
});
