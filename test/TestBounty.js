const Bounties = artifacts.require("Bounties.sol");
const Token = artifacts.require("Token.sol");

const utils = require('./Utils');


contract('Bounties', function(accounts) {


  it("[TOKENS] Verifies that the Bounties registry works", async () => {
    let registry = await Bounties.deployed();
    let owner = await registry.owner();

    assert(owner == accounts[0])

  });


  it("[TOKENS] Verifies that I can issue a new bounty paying in Tokens", async () => {
    let registry = await Bounties.deployed();
    let bountyToken = await Token.deployed();
    let bountyId = 0;

    await registry.issueBounty(0xF633f5bAf5954eE8F357055FE5151DDc27EEfdBF,
                                2528821098,
                                "data",
                                1000,
                                0x0,
                                true,
                                bountyToken.address,{from: accounts[0]});

  });

  it("[TOKENS] verifies that a date before the present will cause a failing construction", async () => {
    let registry = await Bounties.deployed();
    let bountyToken = await Token.deployed();

    try {
      let bountyId = 1;
      await registry.issueBounty(0xF633f5bAf5954eE8F357055FE5151DDc27EEfdBF,
                                  0,
                                  "data",
                                  1000,
                                  0x0,
                                  true,
                                  bountyToken.address,{from: accounts[0]});
    } catch (error){
      return utils.ensureException(error);
    }
    assert(false, "did not error as was expected");

  });

  it("[TOKENS] verifies that a payout of 0 will fail", async () => {
    let registry = await Bounties.deployed();
    let bountyToken = await Token.deployed()

    try {
      let bountyId = 2;
      await registry.issueBounty(accounts[0],
                                  2528821098,
                                  "data",
                                  0,
                                  0x0,
                                  true,
                                  bountyToken.address,{from: accounts[0]});
    } catch (error){
      return utils.ensureException(error);
    }
    assert(false, "did not error as was expected");

  });


  it("[TOKENS] verifies that simple bounty contribution and activation functions", async () => {
    let registry = await Bounties.deployed();
    let bountyToken = await Token.deployed();
    // add bounty contract to be whitelisted
    await bountyToken.setWhiteList(registry.address, true);

    const registerEvent = registry.BountyIssued()
    let bountyId = 0
    registerEvent.watch((error, result) => {
        if (!error) {
            bountyId = result.args.bountyId
        }
    })


    await registry.issueBounty(accounts[0],
                                2528821098,
                                "data",
                                1000,
                                0x0,
                                true,
                                bountyToken.address,
                                {from: accounts[0]});
    await bountyToken.approve(registry.address, 1000, {from: accounts[0]});
    await registry.contribute(bountyId,1000, {from: accounts[0]});
    let bounty = await registry.getBounty(bountyId);
    assert(bounty[4] == 0);
    await registry.activateBounty(bountyId,0, {from: accounts[0]});
    bounty = await registry.getBounty(bountyId);
    assert(bounty[4] == 1);
    registerEvent.stopWatching()
  });

  it("[TOKENS] verifies that basic fulfillment acceptance flow works", async () => {
    let registry = await Bounties.deployed();
    let bountyToken = await Token.deployed()
    // add bounty contract to be whitelisted
    await bountyToken.setWhiteList(registry.address, true);

    const registerEvent = registry.BountyIssued()
    let bountyId = 0
    registerEvent.watch((error, result) => {
        if (!error) {
            bountyId = result.args.bountyId
        }
    })


    await registry.issueBounty(accounts[0],
                                2528821098,
                                "data",
                                1000,
                                0x0,
                                true,
                                bountyToken.address,
                                {from: accounts[0]});
    await bountyToken.approve(registry.address, 1000, {from: accounts[0]});
    await registry.activateBounty(bountyId,1000, {from: accounts[0]});

    await registry.fulfillBounty(bountyId, "data", {from: accounts[1]});

    let fulfillment = await registry.getFulfillment(bountyId,0);
    assert(fulfillment[0] === false);
    await registry.acceptFulfillment(bountyId,0,{from: accounts[0]});
    fulfillment = await registry.getFulfillment(bountyId,0);
    assert(fulfillment[0] === true);
    registerEvent.stopWatching()
  });




});
