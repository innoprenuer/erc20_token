## ERC20 token with Freeze and Airdrop Functions

### 1. Specifications:

1. the account that deployes the contract is the `token contract owner`;
2. `contract owner` has all the tokens at the begining;
3. transfer funds between accounts;
4. owner can freeze any account to prevent tranferring funds out from these accounts;
5. owner can unfreeze accounts to enable transfer;
6. owner can add address to the airdrop list with amount value;
7. owner can lanuch the airdrop to those registered accounts;
8. owner can return a list of all accounts that received tokens;


### 2. JS testing

These features can be tested with `test/TestToken.js` file:

```
$ truffle test test/TestToken.js 
```

The result is similar to following:

<img src='img/test.jpg' />
