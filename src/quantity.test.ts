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

  test("Clone a quantity", () => {
    const inst = new Quantity(2345n, 3n);
    const clone = inst.clone();

    clone._mul(new Quantity(20n, 1n));
    clone._convert(4n);

    expect(clone.raw).not.toEqual(inst.raw);
    expect(clone.denomination).not.toEqual(inst.denomination);
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

  test("Less than operator for the same denomination", () => {
    expect(Quantity.lt(new Quantity(10n, 3n), new Quantity(20n, 3n))).toBeTruthy();
    expect(Quantity.lt(new Quantity(5n, 3n), new Quantity(5n, 3n))).toBeFalsy();
  });

  test("Less than operator for a different denomination", () => {
    expect(Quantity.lt(new Quantity(222n, 3n), new Quantity(50n, 2n))).toBeTruthy();
    expect(Quantity.lt(new Quantity(500n, 2n), new Quantity(500n, 5n))).toBeFalsy();
  });

  test("Less or equal than operator for the same denomination", () => {
    expect(Quantity.le(new Quantity(10n, 3n), new Quantity(20n, 3n))).toBeTruthy();
    expect(Quantity.le(new Quantity(5n, 3n), new Quantity(5n, 3n))).toBeTruthy();
    expect(Quantity.le(new Quantity(5n, 3n), new Quantity(2n, 3n))).toBeFalsy();
  });

  test("Less or equal than operator for a different denomination", () => {
    expect(Quantity.le(new Quantity(100n, 3n), new Quantity(20n, 2n))).toBeTruthy();
    expect(Quantity.le(new Quantity(500n, 5n), new Quantity(5n, 3n))).toBeTruthy();
    expect(Quantity.le(new Quantity(51n, 2n), new Quantity(2n, 3n))).toBeFalsy();
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

  test("Static power (positive)", () => {
    const d1 = 8n;
    const inst1 = new Quantity(BigInt(4.5 * 10 ** Number(d1)), d1);

    const res = Quantity.__pow(inst1, 2);

    expect(res.toString()).toEqual("20.25");
  });

  test("Static power (negative)", () => {
    const d1 = 4n;
    const inst1 = new Quantity(5n * 10n ** d1, d1);

    const res = Quantity.__pow(inst1, -3);

    expect(res.toString()).toEqual("0.008");
  });

  test("In-place power", () => {
    const inst1 = new Quantity(250n, 2n);

    inst1._pow(2);

    expect(inst1.toString()).toEqual("6.25");
  });

  test("Static remainder", () => {
    const inst1 = new Quantity(400n, 2n);
    const inst2 = new Quantity(3000n, 3n);

    const res = Quantity.__mod(inst1, inst2);

    expect(res.toString()).toEqual("1");
  });

  test("In-place remainder", () => {
    const inst1 = new Quantity(600000n, 5n);
    inst1._mod(new Quantity(400n, 2n));

    expect(inst1.toString()).toEqual("2");
  });

  test("Quantity min()", () => {
    const min = new Quantity(1n, 10n);
    const list = [new Quantity(456n, 2n), min, new Quantity(1n, 5n)];
    const res = Quantity.min(...list);

    expect(res).not.toBeUndefined();
    expect(Quantity.eq(res as Quantity, min)).toBeTruthy();
  });

  test("Quantity max()", () => {
    const max = new Quantity(500n, 1n);
    const list = [new Quantity(456n, 2n), max, new Quantity(1n, 5n)];
    const res = Quantity.max(...list);

    expect(res).not.toBeUndefined();
    expect(Quantity.eq(res as Quantity, max)).toBeTruthy();
  });

  test("Static trunc", () => {
    const whole = 5400n;
    const inst = new Quantity(whole + 11n, 2n);

    expect(Quantity.__trunc(inst).raw).toEqual(whole);
  });

  test("In-place trunc", () => {
    const whole = 89340000n;
    const inst = new Quantity(whole + 385n, 4n);

    inst._trunc();

    expect(inst.raw).toEqual(whole);
  });

  test("Static floor", () => {
    const whole = 5400n;
    const inst1 = new Quantity(whole + 11n, 2n);

    expect(Quantity.__floor(inst1).raw.toString()).toEqual(whole.toString());

    const inst2 = new Quantity(-whole + 11n, 2n);

    expect(Quantity.__floor(inst2).raw.toString()).toEqual((-whole).toString());
  });

  test("In-place floor", () => {
    const whole = -89340000n;
    const inst = new Quantity(whole + 385n, 4n);

    inst._floor();

    expect(inst.raw.toString()).toEqual(whole.toString());
  });

  test("Static ceil", () => {
    const whole = 9200n;
    const inst1 = new Quantity(whole - 11n, 2n);

    expect(Quantity.__ceil(inst1).raw.toString()).toEqual(whole.toString());

    const inst2 = new Quantity(-whole - 11n, 2n);

    expect(Quantity.__ceil(inst2).raw.toString()).toEqual((-whole).toString());
  });

  test("In-place ceil", () => {
    const whole = -21570000n;
    const inst = new Quantity(whole - 385n, 4n);

    inst._ceil();

    expect(inst.raw.toString()).toEqual(whole.toString());
  });

  test("Static negation", () => {
    const val = 4568n;

    expect(Quantity.__neg(new Quantity(val, 2n)).raw).toEqual(-val);
    expect(Quantity.__neg(new Quantity(-val, 2n)).raw).toEqual(val);
  });

  test("In-place negation", () => {
    const val = 83754n;
    const inst = new Quantity(val, 2n);

    inst._neg();

    expect(inst.raw).toEqual(-val);

    inst._neg();

    expect(inst.raw).toEqual(val);
  });

  test("Static absolute", () => {
    const val = 4556n;

    expect(Quantity.__abs(new Quantity(-val, 2n)).raw).toEqual(val);
    expect(Quantity.__abs(new Quantity(val, 2n)).raw).toEqual(val);
  });

  test("In-place absolute", () => {
    const val = 89415n;
    const inst1 = new Quantity(-val, 3n);
    inst1._abs();

    expect(inst1.raw).toEqual(val);

    const inst2 = new Quantity(val, 5n);
    inst2._abs();

    expect(inst2.raw).toEqual(val);
  });
});
