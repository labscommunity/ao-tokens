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

