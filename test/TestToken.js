var assert = require('assert');

/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const Token = artifacts.require('Token.sol')

contract('Token', (accounts) => {
    describe('Test User stories', () => {

        it('Should airdrop tokens', async () => {
            const token = await Token.deployed()

            const bal1 = await token.balanceOf.call(accounts[0])
            console.log(`owner (user[0]) has ${bal1.toNumber()} tokens now.`)

            // owner add address to list
            await token.airdropList(accounts[3], 10, {from: accounts[0]})
            console.log(`user[3] has been added into airdrop list with 10 tokens.`)
            await token.airdropList(accounts[4], 50, {from: accounts[0]})
            console.log(`user[4] has been added into airdrop list with 50 tokens.`)
            await token.airdropList(accounts[5], 100, {from: accounts[0]})
            console.log(`user[5] has been added into airdrop list with 100 tokens.`)

            // owner launch airdrop
            await token.airdrop({from: accounts[0]})

            const bal2 = await token.balanceOf.call(accounts[0])
            console.log(`owner (user[0]) has ${bal2.toNumber()} tokens after airdrop.`)

            const bal3 = await token.balanceOf.call(accounts[3])
            console.log(`user[3] has ${bal3.toNumber()} tokens now.`)
            const bal4 = await token.balanceOf.call(accounts[4])
            console.log(`user[4] has ${bal4.toNumber()} tokens now.`)
            const bal5 = await token.balanceOf.call(accounts[5])
            console.log(`user[5] has ${bal5.toNumber()} tokens now.`)

        })

        it('Should return full list of all receiver accounts', async () => {
            const token = await Token.deployed()

            const array = await token.getAccountList({from: accounts[0]});
            console.log(array);
        })

        it('Should freeze and unfreeze accounts', async () => {

            const token = await Token.deployed()
            const balance1 = await token.balanceOf.call(accounts[0])
            console.log(`contract owner (user[0]) has ${balance1.toNumber()} tokens now.`)

            const transferReceipt = await token.transfer(accounts[1], 100, {from: accounts[0]})
            assert(transferReceipt.logs[1].args.frozen === true);

            const balance2 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) has ${balance2.toNumber()} tokens from owner.`)

            console.log(`-------------------------`)

            const freezeAccountReceipt = await token.freezeAccount(accounts[1], true, {from: accounts[0]})
            assert(freezeAccountReceipt.logs[0].args.frozen === true);
            console.log(`contract owner (user[0]) freezes the receiver account (user[1]).`)

            const transfer2Receipt = await token.transfer(accounts[2], 50, {from: accounts[1]})
            assert(transfer2Receipt.logs[0].event === "AccountFrozen");
            console.log(`receiver (user[1]) tries to transfer 50 tokens to other account (user[2]).`)

            const balance3 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) cannot transfer and has ${balance3.toNumber()} tokens.`)

            console.log(`-------------------------`)

            const unfreezeAccountReceipt = await token.freezeAccount(accounts[1], false, {from: accounts[0]})
            assert(unfreezeAccountReceipt.logs[0].args.frozen === false);
            console.log(`contract owner activates the receiver account (user[1]).`)

            const transfer3Receipt = await token.transfer(accounts[2], 50, {from: accounts[1]})
            assert(transfer3Receipt.logs[1].args.frozen === true);

            const balance4 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) can transfer and has ${balance4.toNumber()} tokens now.`)

            const balance5 = await token.balanceOf.call(accounts[2])
            console.log(`other account (user[2]) has ${balance5.toNumber()} tokens received from user[1].`)

        })

        it('Should whitelisted accounts', async () => {

            const token = await Token.deployed()

            const balance1 = await token.balanceOf.call(accounts[0])
            console.log(`contract owner (user[0]) has ${balance1.toNumber()} tokens now.`)

            const transfer1Receipt = await token.transfer(accounts[1], 100, {from: accounts[0]})
            assert(transfer1Receipt.logs[1].args.frozen === true);

            const balance2 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) has ${balance2.toNumber()} tokens from owner and is frozen.`)

            console.log(`-------------------------`)

            const transfer2Receipt = await token.transfer(accounts[2], 50, {from: accounts[1]})
            assert(transfer2Receipt.logs[0].event === "AccountFrozen")

            console.log(`receiver (user[1]) tries to transfer 50 tokens to other account (user[2]).`)
            const balance3 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) cannot transfer and has ${balance3.toNumber()} tokens.`)

            console.log(`-------------------------`)

            const setWhiteListReceipt = await token.setWhiteList(accounts[1], true, {from: accounts[0]})
            assert(setWhiteListReceipt.logs[0].event === "WhiteListUpdated");
            console.log(`contract owner set receiver account (user[1]) into whitelist.`)

            await token.transfer(accounts[2], 50, {from: accounts[1]})

            const balance4 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) can transfer and has ${balance4.toNumber()} tokens now.`)

            const balance5 = await token.balanceOf.call(accounts[2])
            console.log(`other account (user[2]) has ${balance5.toNumber()} tokens received from user[1].`)

        })
    })
})
