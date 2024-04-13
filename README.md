# ao-tokens

This library makes it easy to interact with tokens and operate with token quantities.

## Installation

The library needs `@permaweb/aoconnect` as a peer dependency.

```sh
npm i ao-tokens @permaweb/aoconnect
```

```sh
yarn add ao-tokens @permaweb/aoconnect
```

## Usage

### Tokens

The `Token` class provides basic methods to query token data. It first needs to be loaded:

```ts
// load CRED
const aoCredToken = await Token(
  // id of the token
  "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"
);
```

You can also provide custom configuration for this:

```ts
const aoCredToken = await Token(
  // id of the token
  "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc",
  // custom signer (default is window.arweaveWallet)
  createDataItemSigner(wallet),
  // custom aoconnect instance
  connect({ ... })
);
```

#### Token info

Information about the token, such as `Name`, `Ticker`, `Denomination`, etc. is preloaded:

```ts
const tokenID = aoCredToken.id;
const tokenName = aoCredToken.info.Name;
const symbol = aoCredToken.info.Ticker;
const denomination = aoCredToken.info.Denomination;
const logo = aoCredToken.info.Logo;
```

#### Token quantity

You can easily manage quantities as special, `bigint` based floating point numbers that keep precision, using the `token.Quantity` field. This field provides a [`Quantity`](#quantities) instance every time it's called, with a pre-configured denomination matching the token's denomination. Read more about quantities [here](#quantities).

```ts
// initialise a quantity from a token
const amountToSend = aoCredToken.Quantity.fromString("752.34");
```

#### Wallet balance

You can query the token balance for an address. This will return a `Quantity` instance.

```ts
const balance = await aoCredToken.getBalance(
  // wallet address
  "HjvCPN31XCLxkBo9FUeB7vAK0VCfSeY52-CS-6Iho8l"
);

// prints something like: "1,345.87"
console.log("Your balance is:", balance.existingBal.toLocaleString());
```

#### All balances

Querying all balances will return the balances object stored in the token's memory. Each holder's address is associated with a `Quantity` instance.

```ts
const balances = await aoCredToken.getBalances();

for (const addr in balances) {
  console.log(`${addr} owns ${balances[addr].toLocaleString()} CRED`);
}
```

#### Transfer

The transfer functions allows you to send a message to the token process that initiates the transfer of the provided quantity to a recipient.

```ts
// this will transfer 1000 CRED to the provided address
const id = await aoCredToken.transfer(
  aoCredToken.Quantity.fromString("1000"),
  "XjvCPN31XCLPFBo9FUeB7vAK0VC6TwY52MCS-6Iho8h"
);

console.log("The transfer ID is", id);
```

### Quantities

The `Quantity` class is an implementation of floating point numbers with extreme precision. It works by storing a `bigint` instance as the raw value for token quantities. This is the same value the token process works with, so it makes operations and calculations extremely easy. It helps implementing logic for tokens on the front-end by abstracting calculations with the token denomination away from the developer, executing these within the library.

A quantity first needs to be initialised with the raw quantity provided by the token process (or `0`) and the token denomination:

```ts
// init 0 quantity for a specific denomination
const quantity = new Quantity(0n, token.info.Denomination);
```

If you already have a `Token` instance in scope, you can also use the shortcut [mentioned above](#token-quantity) to initialise a new quantity that belongs to the token process.

#### Raw

This is one of the most important fields of the `Quantity` class. It is a raw `bigint` value that must be used when communicating with a token process, as this is in the same format that token processes use internally for managing balances. For example, if you want to use [`@permaweb/aoconnect`](https://npmjs.com/@permaweb/aoconnect) to transfer tokens, instead of the [built in transfer](#transfer) function, you need to provide the raw value to the message:

```ts
// 751.34 CRED tokens
const quantity = aoCredToken.Quantity.fromString("752.34");

// send these tokens to someone
await message({
  // token process ID
  process: "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc",
  // browser wallet signer
  signer: createDataItemSigner(window.arweaveWallet),
  tags: [
    { name: "Action", value: "Transfer" },
    { name: "Recipient", value: "XjvCPN31XCLPFBo9FUeB7vAK0VC6TwY52MCS-6Iho8h" },
    //
    // notice how we use the raw value
    { name: "Quantity", value: quantity.raw.toString() }
    //
  ]
});
```

#### Other getters

These getters are also accessible from a `Quantity` instance.

- `integer`: Get the integer/whole part of the quantity (for e.g. for `115.67` this will return `115n`)
- `fractional`: Get the fractional part of the quantity in integer (for e.g. for `115.67` this will return `67n`)
- `denomination`: The token denomination this instance uses for calculations

#### `isQuantity()`

Get if a provided value is a valid `Quantity` instance:

```ts
// will return false
Quantity.isQuantity(15);

// wil return true
Quantity.isQuantity(new Quantity(15n, 4n));
```

#### `isQuantityOf()`

Get if a provided value is a valid `Quantity` of a `Token` instance. This will compare the denomination used in the provided `Quantity` instance:


```ts
// CRED has a denomination of 3

// this will return false
Quantity.isQuantityOf(new Quantity(345n, 12n), aoCredToken);

// this will return true
Quantity.isQuantityOf(new Quantity(9456n, 3n), aoCredToken);
```

#### `fromString()`

Parse a quantity from a string:

```ts
aoCredToken.Quantity.fromString("256.8");
```

#### `fromNumber()`

Parse a quantity from a JS number:

```ts
aoCredToken.Quantity.fromNumber(256.8);
```

#### `toString()`

Get the stringified quantity:

```ts
const qty = aoCredToken.Quantity.fromNumber(74.089);

// prints "74.089"
console.log(qty.toString());
```

#### `toLocaleString()`

Print formatted string according to the provided/default locale:

```ts
const qty = aoCredToken.Quantity.fromNumber(1474.089);

// prints "1,474.089"
console.log(qty.toString());
```

#### `toNumber()`

Get JS native floating point value held in a quantity. This can cause precision loss:

```ts
qty.toNumber();
```

#### `clone()`

Clone the `Quantity` instance. This will keep the same value and denomination:

```ts
// 1.2 with 1 as the denomination
const qty = new Quantity(12n, 1n);

const qty2 = qty.clone();
qty2.fromNumber(4);

// prints "1.2"
console.log("qty is", qty.toString());

// prints "4"
console.log("qty2 is", qty2.toString());
```

#### Math and utilities

These functions have both static and non-static implementations. Static implementations will always start with two "`_`" and create new `Quantity` instances. Non-static implementations start with one "`_`" and modify themselves (the instances they are associated with).

##### Math operators

- `eq()`: Check if two quantities are equal
- `lt()`: Check if the first quantity is less than the second
- `le()`: Check if the first quantity is less or equal than the second
- `_add()` and `__add`: Add together two quantities
- `_sub()` and `__sub`: Subtract one quantity from another
- `_mul()` and `__mul()`: Multiply two quantities
- `_div()` and `__div()`: Divide one quantity by another
- `_pow()` and `__pow()`: Raise one quantity to the power of an integer
- `_mod()` and `__mod()`: Get the remainder of the division of one quantity by another
- `_neg()` and `__neg()`: Get the negation of a quantity
- `_abs()` and `__abs()`: Get the absolute value of a quantity
- `_trunc()` and `__trunc()`: Truncate a quantity
- `_floor()` and `__floor()`: Round down a quantity
- `_ceil()` and `__ceil()`: Round up a quantity

##### Utilities

- `_one()` and `__one()`: Shortcut to "1" according to the denomination
- `_convert()` and `__convert()`: Convert to a different denomination
- `sameDenomination()`: Ensure that the provided quantities all have the same denomination. Returns an array of quantities converted to the largest denomination from the provided quantities.
- `min()`: Get the minimum of a list of quantities
- `max()`: Get the maximum of a list of quantities
