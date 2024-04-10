
import { AoInstance, TokenInfo, Id, Owner, getTagValue, Message } from "./utils";
import { connect } from "@permaweb/aoconnect";
import Quantity from "./Quantity";

export default class Token {
  // token id
  #id: string;

  // token info
  #info?: TokenInfo;

  // ao instance
  #ao: AoInstance;

  /**
   * @param id Token process ID
   * @param info Optional loaded token info
   */
  constructor(id: string, info?: TokenInfo, ao = connect()) {
    this.#id = id;
    this.#info = info;
    this.#ao = ao;
  }

  /**
   * Load token private function
   */
  static async #getTokenInfo(id: string, ao: AoInstance): Promise<TokenInfo> {
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
      return {
        Name,
        Ticker,
        Denomination: BigInt(Denomination || 0),
        Logo
      };
    }

    throw new Error("Could not load token");
  }

  /**
   * Load a token instance with token info
   * @param id TokenID
   * @param ao ao instance
   * @returns Token instance
   */
  static async load(id: string, ao = connect()) {
    return new Token(
      id,
      await this.#getTokenInfo(id, ao),
      ao
    );
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
    // load info if it has not yet been loaded
    if (!this.#info) {
      this.#info = await Token.#getTokenInfo(this.#id, this.#ao);
    }

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
}
