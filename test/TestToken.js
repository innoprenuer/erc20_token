var assert = require('assert');

/* global artifacts, assert, contract, describe, it */
/* eslint-disable no-console, max-len */

const Token = artifacts.require('Token.sol')

contract('Token', (accounts) => {
    describe('Test User stories:', () => {

        it('Should freeze and unfreeze accounts', async () => {

            const token = await Token.deployed()
            const balance1 = await token.balanceOf.call(accounts[0])
            console.log(`contract owner (user[0]) has ${balance1.toNumber()/1e18} tokens now.`)

            const transferReceipt = await token.transfer(accounts[1], 100*1e18, {from: accounts[0]})
            assert(transferReceipt.logs[1].args._frozen === true);

            const balance2 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) has ${balance2.toNumber()/1e18} tokens from owner.`)

            console.log(`-------------------------`)

            const freezeAccountReceipt = await token.freezeAccount(accounts[1], true, {from: accounts[0]})
            assert(freezeAccountReceipt.logs[0].args._frozen === true);
            console.log(`contract owner (user[0]) freezes the receiver account (user[1]).`)

            const transfer2Receipt = await token.transfer(accounts[2], 50*1e18, {from: accounts[1]})
            assert(transfer2Receipt.logs[0].event === "AccountFrozen");
            console.log(`receiver (user[1]) tries to transfer 50 tokens to other account (user[2]).`)

            const balance3 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) cannot transfer and has ${balance3.toNumber()/1e18} tokens.`)

            console.log(`-------------------------`)

            const unfreezeAccountReceipt = await token.freezeAccount(accounts[1], false, {from: accounts[0]})
            assert(unfreezeAccountReceipt.logs[0].args._frozen === false);
            console.log(`contract owner activates the receiver account (user[1]).`)

            const transfer3Receipt = await token.transfer(accounts[2], 50*1e18, {from: accounts[1]})
            assert(transfer3Receipt.logs[1].args._frozen === true);

            const balance4 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) can transfer and has ${balance4.toNumber()/1e18} tokens now.`)

            const balance5 = await token.balanceOf.call(accounts[2])
            console.log(`other account (user[2]) has ${balance5.toNumber()/1e18} tokens received from user[1].`)

        })

        it('Should whitelisted accounts', async () => {

            const token = await Token.deployed()

            const balance1 = await token.balanceOf.call(accounts[0])
            console.log(`contract owner (user[0]) has ${balance1.toNumber()/1e18} tokens now.`)

            const transfer1Receipt = await token.transfer(accounts[1], 100*1e18, {from: accounts[0]})
            assert(transfer1Receipt.logs[1].args._frozen === true);

            const balance2 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) has ${balance2.toNumber()/1e18} tokens from owner and is frozen.`)

            console.log(`-------------------------`)

            const transfer2Receipt = await token.transfer(accounts[2], 50*1e18, {from: accounts[1]})
            assert(transfer2Receipt.logs[0].event === "AccountFrozen")

            console.log(`receiver (user[1]) tries to transfer 50 tokens to other account (user[2]).`)
            const balance3 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) cannot transfer and has ${balance3.toNumber()/1e18} tokens.`)

            console.log(`-------------------------`)

            const setWhiteListReceipt = await token.setWhiteList(accounts[1], true, {from: accounts[0]})
            assert(setWhiteListReceipt.logs[0].event === "WhiteListUpdated");
            console.log(`contract owner set receiver account (user[1]) into whitelist.`)

            await token.transfer(accounts[2], 50*1e18, {from: accounts[1]})

            const balance4 = await token.balanceOf.call(accounts[1])
            console.log(`receiver (user[1]) can transfer and has ${balance4.toNumber()/1e18} tokens now.`)

            const balance5 = await token.balanceOf.call(accounts[2])
            console.log(`other account (user[2]) has ${balance5.toNumber()/1e18} tokens received from user[1].`)

        })

        it('Should return full list of all receiver accounts', async () => {
            const token = await Token.deployed()

            const array = await token.getAccountList({from: accounts[0]});
            console.log(array);
        })
    })
})
