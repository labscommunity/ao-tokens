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
   * Raw base quantity
   */
  get raw() {
    return this.#qty;
  }

  /**
   * Integer/whole part
   */
  get integer() {
    const qtyStr = this.#qty.toString();
    return BigInt(
      qtyStr.slice(0, qtyStr.length - Number(this.#D))
    );
  }

  /**
   * Fractional part in integers
   */
  get fractional() {
    const qtyStr = this.#qty.toString();
    return BigInt(
      qtyStr.slice(qtyStr.length - Number(this.#D), qtyStr.length)
    );
  }

  /**
   * Denomination
   */
  get denomination() {
    return this.#D;
  }

  /**
   * Load a quantity from a string while keeping precision
   * until the denomination is reached
   * @param value String to load as a quantity
   */
  fromString(value: string) {
    if (!value) {
      this.#qty = 0n;
      return;
    }

    // replace formatters
    value = value.replace(/,/g, "");

    // empty value
    if (value === "") {
      this.#qty = 0n;
      return;
    }

    // multiplier according to the denomination
    const dMul = 10n ** this.#D;

    // calculate result
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
   * Load a quantity from a number while keeping precision
   * until the denomination is reached
   * @param value Number to load as a quantity
   */
  fromNumber(value: number) {
    return this.fromString(value.toString());
  }

  /**
   * Format a quantity as a floating point number string,
   * while keeping precision (using the provided 
   * denomination)
   * @param options Optinal formatting for the number
   * @returns Formatted string
   */
  toLocaleString(locales?: Intl.LocalesArgument, options: BigIntToLocaleStringOptions = {}) {
    if (!this.#qty) return "0";
    if (!options.maximumFractionDigits) {
      // @ts-expect-error
      options.maximumFractionDigits = Number(this.#D) > 20 ? 20 : Number(this.#D);
    }

    // multiplier according to the denomination
    const dMul = 10n ** this.#D;

    // fractional and integer parts
    const integerPart = this.#qty / dMul;

    // return value
    let formatted = integerPart.toLocaleString(
      locales,
      { ...options, maximumFractionDigits: 0, minimumFractionDigits: 0 }
    );

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

      // add more fractions if required
      if ((options.minimumFractionDigits || 0) > fractions.length) {
        fractions += "0".repeat((options.minimumFractionDigits || 0) - fractions.length);
      }

      if (fractions !== "" && BigInt(fractions) > 0n) {
        formatted += "." + fractions.replace(/0*$/, "");
      }
    }

    return formatted;
  }

  /**
   * Format a quantity as a floating point number string,
   * while keeping precision (using the provided 
   * denomination)
   */
  toString() {
    return this.toLocaleString(
      undefined,
      { useGrouping: false }
    );
  }

  /**
   * Format a quantity as a JavaScript floating point number.
   * This while cause precision loss
   */
  toNumber() {
    // minimize precision loss by first creating a string
    const str = this.toString();

    return parseFloat(str);
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

  /**
   * Operators
   */

  /**
   * Bring two quantities to the same denomination
   * (will always bring to the larger one)
   * @param ... Quantities
   * @returns The quantitieson the same denomination
   */
  static sameDenomination(...quantities: Quantity[]) {
    if (quantities.length < 1) return quantities;

    // find the largest denomination
    const largestDenomination = quantities.reduce(
      (prev, curr) => prev.#D > curr.#D ? prev : curr
    ).#D;

    // adjust quantities
    for (let i = 0; i < quantities.length; i++) {
      if (quantities[i].#D === largestDenomination) continue;
      const diff = largestDenomination - quantities[i].#D;

      quantities[i].#qty = quantities[i].#qty * 10n ** diff;
      quantities[i].#D = largestDenomination;
    }

    return quantities;
  }

  /**
   * Check if quantities are equal
   * @param x First quantity
   * @param y Second quantity
   */
  static eq(x: Quantity, y: Quantity) {
    // ensure that the two qtys have the same denomination
    [x, y] = this.sameDenomination(x, y);

    return x.#qty === y.#qty;
  }

  /**
   * Add together two quantities
   * @param x First quantity
   * @param y Second quantity
   * @returns Result of the addition (with the larger denomination)
   */
  static __add(x: Quantity, y: Quantity) {
    // ensure that the two qtys have the same denomination
    [x, y] = this.sameDenomination(x, y);

    return new Quantity(
      x.#qty + y.#qty,
      x.#D
    );
  }

  /**
   * Add together two quantities (in-place). This might cause
   * precision loss if y has a larger denomination
   * @param y Second quantity
   */
  _add(y: Quantity) {
    const res = Quantity.__add(this, y).convert(this.#D);
    this.#qty = res.#qty;
  }
}
