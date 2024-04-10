import Quantity from "./Quantity";

describe("Quantity testing", () => {
  test("Init quantity", () => {
    const d = 2n;
    const int = 1n;
    const frac = 23n;
    const val = int * 10n ** d + frac;

    const inst = new Quantity(val, d);

    expect(inst.integer).toEqual(int);
    expect(inst.fractional).toEqual(frac);
  });

  test("Parse from string", () => {
    const inst = new Quantity(undefined, 2n);
    const int = 855n;
    const frac = 31n;

    inst.fromString(int.toString() + "." + frac.toString());
    
    expect(inst.integer).toEqual(int);
    expect(inst.fractional).toEqual(frac);
  });

  test("Parse from formatted string", () => {
    const inst = new Quantity(undefined, 2n);
    const int = 12456n;
    const frac = 55n;

    inst.fromString(int.toLocaleString() + "." + frac.toString());

    expect(inst.integer).toEqual(int);
    expect(inst.fractional).toEqual(frac);
  });

  test("Parse from string with 0s before after the fraction point", () => {
    const inst = new Quantity(undefined, 5n);
    const int = 12456n;
    const frac = 55n;
    
    inst.fromString(int.toString() + ".000" + frac.toString());

    expect(inst.integer).toEqual(int);
    expect(inst.fractional).toEqual(frac);
  });

  test("Parse from integer string", () => {
    const inst = new Quantity(undefined, 5n);
    const int = 5355358924n;

    inst.fromString(int.toString());

    expect(inst.integer).toEqual(int);
    expect(inst.fractional).toEqual(0n);
  });

  test("Parse from number", () => {
    const inst = new Quantity(undefined, 3n);
    const val = 245.598;

    inst.fromNumber(val);

    expect(inst.integer).toEqual(BigInt(Math.floor(val)));
    expect(inst.fractional).toEqual(BigInt(val.toString().split(".")[1]));
  });

  test("Format as string", () => {
    const inst = new Quantity(undefined, 4n);
    const v = "14564.5299";

    inst.fromString(v);

    expect(inst.toString()).toBe(v);
  });

  test("Format as number", () => {
    const inst = new Quantity(undefined, 10n);
    const v = 34.5;

    inst.fromNumber(v);

    expect(inst.toNumber()).toEqual(v);
  });

  test("Convert to a quantity with a different denomination", () => {
    const baseQty = 15529585725794n;
    const inst = new Quantity(baseQty, 10n);

    expect(Quantity.__convert(inst, 12n).raw).toEqual(baseQty * 10n ** 2n);
  });

  test("Convert to a quantity with a different denomination (in-place)", () => {
    const baseQty = 873576n;
    const inst = new Quantity(baseQty, 5n);

    inst._convert(7n);

    expect(inst.raw).toEqual(baseQty * 10n ** 2n)
  });
});
