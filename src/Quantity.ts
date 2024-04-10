import { type TokenInstance } from "./Token";

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
  constructor(base?: bigint | string | number, denomination = 0n) {
    this.#D = denomination;
    this.#qty = 0n;

    // init
    switch (typeof base) {
      case "bigint":
        this.#qty = base;
        break;
      case "string":
        this.fromString(base);
        break;
      case "number":
        if (!Number.isInteger(base)) {
          throw new Error("Cannot create Quantity from a non-integer number");
        }
        this.#qty = BigInt(base);
        break;
      case "object":
        if (Quantity.isQuantity(base)) {
          this.#qty = (base as Quantity).#qty;
          this.#D = (base as Quantity).#D;
          break;
        }
        throw new Error("Could not convert object to quantity");
      case "undefined":
        break;
      default:
        throw new Error("Could not create Quantity from " + typeof base);
    }
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
   * Check if a value is a valid quantity
   * @param val Value to check
   * @returns Valid or not
   */
  static isQuantity(val: unknown): val is Quantity {
    return typeof val === "object" && val instanceof Quantity;
  }
  
  /**
   * Check if a value is a quantity of a token process
   * (this only works if the token info has been loaded)
   * @param val Value to check
   * @param token Token process instance
   * @returns Valid or not
   */
  static isQuantityOf(val: Quantity, token: TokenInstance) {
    if (Quantity.isQuantity(val)) return false;
    return token.info?.Denomination === (val as Quantity).#D;
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
   * Clone Quantity instance
   */
  clone() {
    return new Quantity(
      this.#qty,
      this.#D
    );
  }

  /**
   * Shortcut/set to to one (in-place)
   */
  _one() {
    this.#qty = 10n ** this.#D;
  }

  /**
   * Shortcut/set to one
   */
  static __one(denomination: bigint = 0n) {
    return new Quantity(
      10n ** denomination,
      denomination
    );
  }

  /**
   * Convert the quantity (in-place) to use a different
   * denomination
   * @param newDenomination Denomination to convert to
   */
  _convert(newDenomination: bigint) {
    const newInst = Quantity.__convert(this, newDenomination);

    this.#D = newDenomination;
    this.#qty = newInst.#qty;
  }

  /**
   * Create a new instance with the same quantity, but a
   * different denomination. This will cause precision
   * loss if the new denomination is smaller than the
   * original
   * @param quantity Quantity to convert
   * @param newDenomination Denomination to convert to
   * @returns New instance
   */
  static __convert(instance: Quantity, newDenomination: bigint): Quantity {
    const denominationDiff = newDenomination - instance.#D;

    // downscale
    let newQty = 0n;

    // upscale
    if (newDenomination >= instance.#D) {
      newQty = instance.#qty * 10n ** denominationDiff;
    } else {
      newQty = instance.#qty / 10n ** -denominationDiff;
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

      quantities[i] = Quantity.__convert(
        quantities[i],
        largestDenomination
      );
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
    const res = Quantity.__convert(
      Quantity.__add(this, y),
      this.#D
    );
    this.#qty = res.#qty;
  }

  /**
   * Subtract one quantity from another
   * @param x Quantity to subtract from
   * @param y Quantity to subtract
   * @returns Result of the addition (with the larger denomination)
   */
  static __sub(x: Quantity, y: Quantity) {
    // ensure that the two qtys have the same denomination
    [x, y] = this.sameDenomination(x, y);

    return new Quantity(
      x.#qty - y.#qty,
      x.#D
    );
  }

  /**
   * Subtract one quantity from another (in-place). This might cause
   * precision loss if y has a larger denomination
   * @param y Quantity to subtract
   */
  _sub(y: Quantity) {
    const res = Quantity.__convert(
      Quantity.__sub(this, y),
      this.#D
    );
    this.#qty = res.#qty;
  }

  /**
   * Multiply one quantity by another
   * @param x First quantity
   * @param y Second quantity
   * @returns Result of the multiplication (with the larger denomination)
   */
  static __mul(x: Quantity, y: Quantity) {
    // ensure that the two qtys have the same denomination
    [x, y] = this.sameDenomination(x, y);

    return new Quantity(
      x.#qty * y.#qty / 10n ** x.#D,
      x.#D
    );
  }

  /**
   * Multiply one quantity by another (in-place). This might cause
   * precision loss if y has a larger denomination
   * @param y Quantity to multiply by
   */
  _mul(y: Quantity) {
    const res = Quantity.__convert(
      Quantity.__mul(this, y),
      this.#D
    );
    this.#qty = res.#qty;
  }

  /**
   * Divide one quantity by another (can cause precision loss)
   * @param x Quantity to divide
   * @param y Quantity to divide with
   * @returns Result of the addition (with the larger denomination)
   */
  static __div(x: Quantity, y: Quantity) {
    // ensure that the two qtys have the same denomination
    [x, y] = this.sameDenomination(x, y);

    return new Quantity(
      x.#qty * 10n ** x.#D / y.#qty,
      x.#D
    );
  }

  /**
   * Divide one quantity by another (in-place). This might cause
   * precision loss if y has a larger denomination
   * @param y Quantity to divide with
   */
  _div(y: Quantity) {
    const res = Quantity.__convert(
      Quantity.__div(this, y),
      this.#D
    );
    this.#qty = res.#qty;
  }

  /**
   * Raise one quantity to the power of an integer. This can cause precision loss
   * @param x Quantity to raise
   * @param y Exponent
   * @returns Result of the power operation
   */
  static __pow(x: Quantity, y: number) {
    if (!Number.isInteger(y)) {
      throw new Error("Cannot raise Quantity to the power of a non-integer number");
    }
    if (y === 0) return new Quantity(0, x.#D);

    let res = x.clone();

    for (let i = 0; i < Math.abs(y) - 1; i++) {
      res._mul(x);
    }

    // negative exponent
    if (y < 0) {
      res = Quantity.__div(
        Quantity.__one(res.#D),
        res
      );
    }

    return res;
  }

  /**
   * Raise one quantity to the power of an integer (in-place). This can cause
   * precision loss
   * @param y Exponent
   */
  _pow(y: number) {
    const res = Quantity.__convert(
      Quantity.__pow(this, y),
      this.#D
    );
    this.#qty = res.#qty;
  }
}
