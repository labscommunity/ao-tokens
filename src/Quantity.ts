export default class Quantity {
  // base quantity
  #qty: bigint;

  // denomination
  #D: bigint;

  /**
   * Parse or load 
   * @param base Quantity in integer/non-denominated format or string
   * @param denomination Denomination that belongs to the token
   */
  constructor(base?: bigint | string, denomination = 0n) {
    this.#D = denomination;
    this.#qty = 0n;

    if (typeof base === "bigint") this.#qty = base;
    else if (typeof base === "string") this.fromString(base);
  }

  /**
   * Load a quantity from a string while keeping precision
   * @param value String to load as a quantity
   */
  fromString(value: string) {
    if (!value) {
      this.#qty = 0n;
      return;
    }

    // multiplier according to the denomination
    const dMul = 10n ** this.#D;

    // replace formatters
    value = value.replace(/,/g, "");

    // empty value
    if (value === "") {
      this.#qty = 0n;
      return;
    }

    let result = BigInt(value.split(".")[0]) * dMul;
    const plainFractions = value.split(".")[1];

    if (plainFractions && plainFractions !== "") {
      // select part that is max. as long as the denomination
      // the other part is discarded
      const relevantPart = plainFractions.slice(0, Number(this.#D));
      let fractionalPart = BigInt(relevantPart);

      // fill to match denomination
      if (BigInt(relevantPart.length) < this.#D) {
        fractionalPart = fractionalPart * 10n ** (this.#D - BigInt(relevantPart.length));
      }

      result += fractionalPart;
    }

    // set result
    this.#qty = result;
  }

  /**
   * Format a quantity as a floating point number string,
   * while keeping precision (using the provided 
   * denomination)
   * @param options Optinal formatting for the number
   * @returns Formatted string
   */
  toString(options: Intl.NumberFormatOptions = { maximumFractionDigits: 2 }) {
    if (!this.#qty) return "0";

    // multiplier according to the denomination
    const dMul = 10n ** this.#D;

    // fractional and integer parts
    const integerPart = this.#qty / dMul;

    // return value
    let formatted = integerPart.toLocaleString();

    // add fractions
    if (options.maximumFractionDigits !== 0) {
      // starting index of the fractional part
      const fractionalPartStart = integerPart !== 0n ? integerPart.toString().length : 0;

      // calculate fractional part
      let fractions = this.#qty
        .toString()
        .slice(fractionalPartStart)
        .padStart(Number(this.#D), "0")
        .slice(0, options.maximumFractionDigits);

      if (fractions !== "" && BigInt(fractions) > 0n) {
        formatted += "." + fractions.replace(/0*$/, "");
      }
    }

    return formatted;
  }

  /**
   * Create a new instance with the same quantity, but a
   * different denomination. This will cause precision
   * loss if the new denomination is smaller than the
   * original
   * @param newDenomination Denomination to convert to
   * @returns New instance
   */
  convert(newDenomination: bigint): Quantity {
    const denominationDiff = newDenomination - this.#D;

    // downscale
    let newQty = this.#qty / 10n ** denominationDiff;

    // upscale
    if (newDenomination >= this.#D) {
      newQty = this.#qty * 10n ** denominationDiff;
    }

    return new Quantity(newQty, newDenomination);
  }
}
