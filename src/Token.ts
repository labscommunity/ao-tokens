
import { AoInstance, TokenInfo, Id, Owner, getTagValue, Message } from "./utils";
import { connect } from "@permaweb/aoconnect";

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
   * Load a token instance with token info
   * @param id TokenID
   * @param ao ao instance
   * @returns Token instance
   */
  static async load(id: string, ao = connect()) {
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
      return new Token(
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

    throw new Error("Could not load token");
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
}
