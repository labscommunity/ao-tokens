
import { AoInstance, TokenInfo, Id, Owner, getTagValue, Message, Balances } from "./utils";
import { connect } from "@permaweb/aoconnect";
import Quantity from "./Quantity";

export default async function Token(id: string, ao = connect()) {
  // query ao
  const res = await ao.dryrun({
    Id,
    Owner,
    process: id,
    tags: [{ name: "Action", value: "Info" }]
  });

  // find message with token info
  for (const msg of res.Messages as Message[]) {
    const Ticker = getTagValue("Ticker", msg.Tags);
    const Name = getTagValue("Name", msg.Tags);
    const Denomination = getTagValue("Denomination", msg.Tags);
    const Logo = getTagValue("Logo", msg.Tags);

    if (!Ticker && !Name) continue;

    // if the message was found, return the token details  
    return new TokenInstance(
      id,
      {
        Name,
        Ticker,
        Denomination: BigInt(Denomination || 0),
        Logo
      },
      ao
    );
  }

  throw new Error("Could not load token info.");
}

export class TokenInstance {
  // token id
  #id: string;

  // token info
  #info: TokenInfo;

  // ao instance
  #ao: AoInstance;

  /**
   * @param id Token process ID
   * @param info Optional loaded token info
   */
  constructor(id: string, info: TokenInfo, ao: AoInstance) {
    this.#id = id;
    this.#info = info;
    this.#ao = ao;
  }

  /**
   * Token ID
   */
  get id() {
    return this.#id;
  }

  /**
   * Get token info
   */
  get info() {
    return this.#info;
  }

  /**
   * Get balance for an address
   * @param address Wallet address
   * @returns Balance in Quantity format
   */
  async getBalance(address: string) {
    // query ao
    const res = await this.#ao.dryrun({
      Id,
      Owner: address,
      process: this.#id,
      tags: [{ name: "Action", value: "Balance" }]
    });
  
    // find result message
    for (const msg of res.Messages as Message[]) {
      const balance = getTagValue("Balance", msg.Tags);
  
      // return balance if found
      if (balance) {
        return new Quantity(
          balance,
          this.#info.Denomination
        );
      }
    }
  
    // default return
    return new Quantity(0, this.#info.Denomination);
  }

  /**
   * Get all balances
   * @returns Token balances
   */
  async getBalances(): Promise<Balances> {
    // query ao
    const res = await this.#ao.dryrun({
      Id,
      Owner,
      process: this.#id,
      tags: [{ name: "Action", value: "Balances" }]
    });
    const bals: Balances = {};
      
    // find result message
    for (const msg of res.Messages as Message[]) {
      const target = getTagValue("Balance", msg.Tags);
      
      // return balance if found
      if (target !== Owner|| !msg.Data) continue;
      
      try {
        const raw = JSON.parse(msg.Data);

        for (const addr in raw) {
          bals[addr] = new Quantity(
            raw[addr],
            this.#info.Denomination
          );
        }
      } catch {}
    }

    return bals;
  }
}
