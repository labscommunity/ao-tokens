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

  test("Bringing two quantities to the same denomination", () => {
    const val1 = 425256n;
    const val2 = 495858998n;
    let inst1 = new Quantity(val1, 4n);
    let inst2 = new Quantity(val2, 6n);

    [inst1, inst2] = Quantity.sameDenomination(inst1, inst2);

    expect(inst1.raw).toEqual(val1 * 10n ** 2n);
    expect(inst2.raw).toEqual(val2);
  });

  test("Equals operator for the same denomination", () => {
    expect(
      Quantity.eq(new Quantity(2n, 12n), new Quantity(2n, 12n))
    ).toBeTruthy();
    expect(
      Quantity.eq(new Quantity(2n, 12n), new Quantity(3n, 12n))
    ).toBeFalsy();
  });

  test("Equals operator for a different denomination", () => {
    expect(Quantity.eq(
      new Quantity(200n, 12n), new Quantity(2n, 10n)
    )).toBeTruthy();
    expect(Quantity.eq(
      new Quantity(200n, 12n), new Quantity(200n, 10n)
    )).toBeFalsy();
  });

  test("Static add operator", () => {
    const val1 = 23.84;
    const val2 = 556.2345;
    const d1 = 2n;
    const d2 = 4n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    const res = Quantity.__add(inst1, inst2);

    expect(res.toString()).toEqual("580.0745");
  });

  test("In-place add operator", () => {
    const val1 = 44.56;
    const val2 = 29.731;
    const d1 = 2n;
    const d2 = 3n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    inst1._add(inst2);

    expect(inst1.toString()).toEqual("74.29");
  });

  test("Static subtract", () => {
    const val1 = 22.5;
    const val2 = 8.25;
    const d1 = 12n;
    const d2 = 3n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    const res = Quantity.__sub(inst1, inst2);

    expect(res.toString()).toEqual("14.25");
  });

  test("In-place subtract operator", () => {
    const val1 = 95.75;
    const val2 = 23.13;
    const d1 = 6n;
    const d2 = 3n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    inst1._sub(inst2);

    expect(inst1.toString()).toEqual("72.62");
  });

  test("Static multiplication", () => {
    const val1 = 1.25;
    const val2 = 0.5;
    const d1 = 4n;
    const d2 = 3n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    const res = Quantity.__mul(inst1, inst2);

    expect(res.toString()).toEqual("0.625");
  });

  test("In-place multiplication", () => {
    const val1 = 456;
    const val2 = 2.5;
    const d1 = 12n;
    const d2 = 9n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    inst1._mul(inst2);

    expect(inst1.toString()).toBe("1140");
  });

  test("Static division", () => {
    const val1 = 456.82;
    const val2 = 2.2;
    const d1 = 11n;
    const d2 = 12n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    const res = Quantity.__div(inst1, inst2);

    expect(res.toString()).toEqual("207.645454545454");
  });

  test("In-place division", () => {
    const val1 = 456;
    const val2 = 2.5;
    const d1 = 4n;
    const d2 = 5n;
    const inst1 = new Quantity(BigInt(val1 * 10 ** Number(d1)), d1);
    const inst2 = new Quantity(BigInt(val2 * 10 ** Number(d2)), d2);

    inst1._div(inst2);

    expect(inst1.toString()).toEqual("182.4");
  });
});
