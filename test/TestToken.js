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
            await token.airdropList(accounts[3], 10, { from: accounts[0] })
            console.log(`user[3] has been added into airdrop list with 10 tokens.`)
            await token.airdropList(accounts[4], 50, { from: accounts[0] })
            console.log(`user[4] has been added into airdrop list with 50 tokens.`)
            await token.airdropList(accounts[5], 100, { from: accounts[0] })
            console.log(`user[5] has been added into airdrop list with 100 tokens.`)

            // owner launch airdrop
            await token.airdrop({ from: accounts[0] })

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

            const array = await token.getAccountList({ from: accounts[0] });
            console.log(array);
        })


        it('Should freeze and unfreeze accounts', async () => {

          const token = await Token.deployed()
          const bal1 = await token.balanceOf.call(accounts[0])
          console.log(`contract owner (user[0]) has ${bal1.toNumber()} tokens now.`)

          await token.transfer(accounts[1], 100, { from: accounts[0] })
          const bal2 = await token.balanceOf.call(accounts[1])
          console.log(`receiver (user[1]) has ${bal2.toNumber()} tokens from owner.`)


          console.log(`-------------------------`)

          await token.freezeAccount(accounts[1], true, { from: accounts[0] })
          console.log(`contract owner (user[0]) freezes the receiver account (user[1]).`)

          await token.transfer(accounts[2], 50, { from: accounts[1] })
          console.log(`receiver (user[1]) tries to transfer 50 tokens to other account (user[2]).`)
          const bal3 = await token.balanceOf.call(accounts[1])
          console.log(`receiver (user[1]) cannot transfer and has ${bal3.toNumber()} tokens.`)

          console.log(`-------------------------`)

          await token.freezeAccount(accounts[1], false, { from: accounts[0] })
          console.log(`contract owner activates the receiver account (user[1]).`)

          await token.transfer(accounts[2], 50, { from: accounts[1] })
          const bal4 = await token.balanceOf.call(accounts[1])
          console.log(`receiver (user[1]) can transfer and has ${bal4.toNumber()} tokens now.`)

          const bal5 = await token.balanceOf.call(accounts[2])
          console.log(`other account (user[2]) has ${bal5.toNumber()} tokens received from user[1].`)

        })


        it('Should whitelisted accounts', async () => {

          const token = await Token.deployed()
          const bal1 = await token.balanceOf.call(accounts[0])
          console.log(`contract owner (user[0]) has ${bal1.toNumber()} tokens now.`)

          await token.transfer(accounts[1], 100, { from: accounts[0] })
          const bal2 = await token.balanceOf.call(accounts[1])
          console.log(`receiver (user[1]) has ${bal2.toNumber()} tokens from owner and is frozen.`)


          console.log(`-------------------------`)

          await token.transfer(accounts[2], 50, { from: accounts[1] })
          console.log(`receiver (user[1]) tries to transfer 50 tokens to other account (user[2]).`)
          const bal3 = await token.balanceOf.call(accounts[1])
          console.log(`receiver (user[1]) cannot transfer and has ${bal3.toNumber()} tokens.`)

          console.log(`-------------------------`)

          await token.setWhiteList(accounts[1], true, { from: accounts[0] })
          console.log(`contract owner set receiver account (user[1]) into whitelist.`)

          await token.transfer(accounts[2], 50, { from: accounts[1] })
          const bal4 = await token.balanceOf.call(accounts[1])
          console.log(`receiver (user[1]) can transfer and has ${bal4.toNumber()} tokens now.`)

          const bal5 = await token.balanceOf.call(accounts[2])
          console.log(`other account (user[2]) has ${bal5.toNumber()} tokens received from user[1].`)

        })
    })
})
