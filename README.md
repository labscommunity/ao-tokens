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
