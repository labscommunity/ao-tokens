export default class Token {
  #id: string;
  #info?: TokenInfo;

  /**
   * @param id Token process ID
   * @param info Optional loaded token info
   */
  constructor(id: string, info?: TokenInfo) {
    this.#id = id;
    this.#info = info;
  }

  /**
   * Load a token instance with token info
   */
  static async load(id: string) {
    return new Token(id, info);
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

interface TokenInfo {
  Name?: string;
  Ticker?: string;
  Denomination: bigint;
  Logo?: string;
}
