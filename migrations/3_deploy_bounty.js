/* global artifacts */

const Token = artifacts.require('Token.sol')
const Bounty = artifacts.require('Bounties.sol')


const deployBounty = (deployer) => {
    const tokenAddress = Token.address

    deployer.deploy(
        Bounty,
        tokenAddress
    )
}
module.exports = deployBounty
