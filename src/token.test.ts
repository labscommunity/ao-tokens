import { createDataItemSigner } from "@permaweb/aoconnect";
import { JWKInterface } from "arweave/node/lib/wallet";
import Token, { type TokenInstance } from "./Token";
import Quantity from "./Quantity";
import Arweave from "arweave";

describe("Token testing", () => {
  const tokenID = "QcV_onYmp_sIlMnQXYXYGFQNkGk47Xfevq5rTGy-3qY";
  let token: TokenInstance;
  let wallet: JWKInterface;

  beforeAll(async () => {
    const arweave = new Arweave({
      host: "arweave.net",
      port: 443,
      protocol: "https"
    });
    wallet = await arweave.wallets.generate();
    token = await Token(tokenID, createDataItemSigner(wallet));
  }, 12000);

  test("Load token", () => {
    expect(token).not.toBeUndefined();
    expect(token.info).not.toBeUndefined();
    expect(token.info.Name).toEqual("Points Coin");
  });

  test("Quantity is of token", async () => {
    const validQty = new Quantity(324n, 12n);
    const invalidQty = new Quantity(14529n, 5n);

    expect(Quantity.isQuantityOf(validQty, token)).toBeTruthy();
    expect(Quantity.isQuantityOf(invalidQty, token)).toBeFalsy();
  });

  test("Quantity instance for token", () => {
    const inst1 = token.Quantity.fromString("1000.245");

    expect(Quantity.isQuantityOf(inst1, token)).toBeTruthy();
    expect(inst1.toString()).toEqual("1000.245");

    const inst2 = token.Quantity.fromNumber(2);

    expect(Quantity.isQuantityOf(inst2, token)).toBeTruthy();
    expect(inst2.toString()).toEqual("2");
    expect(inst1.toString()).toEqual("1000.245");
  });

  test("Get balance returns the correct balance", async () => {
    const existingBal = await token.getBalance(tokenID);

    expect(existingBal.raw.toString()).toEqual("10000000000000000");
    expect(existingBal.toString()).toEqual("10000");
    expect(Quantity.isQuantityOf(existingBal, token)).toBeTruthy();

    const noBal = await token.getBalance(
      "HjvCPN31XCLxkBo9FUeB7vAK0VCfSeY52-CS-6Iho8l"
    );

    expect(noBal.raw.toString()).toEqual("0");
    expect(noBal.toString()).toEqual("0");
    expect(Quantity.isQuantityOf(existingBal, token)).toBeTruthy();
  });

  test("Get balances returns token balances", async () => {
    const balances = await token.getBalances();

    expect(balances[tokenID]?.raw.toString()).toEqual("10000000000000000");
  });
});
