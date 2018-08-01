pragma solidity ^0.4.24;

import './zeppelin/StandardToken.sol';

contract Token is StandardToken {
    address public owner;

    string public constant name = 'ProtoOcean';                         // Set the token name for display
    string public constant symbol = 'PRO';                              // Set the token symbol for display

    // SUPPLY
    uint8 public constant decimals = 0;                               // Set the number of decimals for display
    uint256 public constant initialSupply = 1400000000;                 // OceanToken total supply

    // all balance
    uint256 public totalSupply;

    // mapping
    mapping (address => bool) public frozenAccount;
    mapping (address => bool) public whiteList;

    struct Airdrop {
      address account;
      uint256 amount;
    }
    Airdrop[] public mAirdrops;

    // full list of receiver accounts
    address[] public addressLUT;

    // events
    event FrozenFunds(address target, bool frozen);
    event WhiteListUpdated(address target, bool isWhitelisted);

    // modifier
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // constructor function
    constructor() public {
        // set _owner
        owner = msg.sender;
        // total supply
        totalSupply = initialSupply;
        // owner of token contract has all tokens
        balances[msg.sender] = initialSupply;
    }

    // returns full list of receiver addresses
    function getAccountList() public view returns (address[]) {
        address[] memory v = new address[](addressLUT.length);
        for (uint256 i=0; i < addressLUT.length; i++) {
            v[i] = addressLUT[i];
        }
        return v;
    }

    // airdrops tokens to accounts
    function airdropList(address user, uint256 amount) public onlyOwner {
        mAirdrops.push(Airdrop(user, amount));
    }

    function airdrop() public onlyOwner {
        uint256 arrayLength = mAirdrops.length;
        for (uint256 i=0; i < arrayLength; i++) {
            transfer(mAirdrops[i].account, mAirdrops[i].amount);
        }
    }

    // add acount to whiteList - true means no-freeze
    function setWhiteList(address target, bool isWhitelisted) public onlyOwner {
        whiteList[target] = isWhitelisted;
        emit WhiteListUpdated(target, isWhitelisted);
    }

    // freeze accounts
    function freezeAccount(address target, bool freeze) public onlyOwner {
        frozenAccount[target] = freeze;
        emit FrozenFunds(target, freeze);
    }

    /**
    * @dev Transfer token for a specified address when not paused
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
        // source account shall not be freezed
        if(frozenAccount[msg.sender]){
            return false;
        }
        require(_to != address(0));
        // record the receiver address into list
        addressLUT.push(_to);
        // transfer fund first if sender is not frozen
        require(super.transfer(_to, _value));
        // automatically freeze receiver that is not whitelisted
        if (frozenAccount[_to] == false && whiteList[_to] == false){
            frozenAccount[_to] = true;
            emit FrozenFunds(_to, true);
        }
        return true;
    }

    /**
    * @dev Transfer tokens from one address to another when not paused
    * @param _from address The address which you want to send tokens from
    * @param _to address The address which you want to transfer to
    * @param _value uint256 the amount of tokens to be transferred
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        // source account shall not be freezed
        require(!frozenAccount[_from]);
        addressLUT.push(_to);
        // transfer fund
        require(super.transferFrom(_from, _to, _value));
        // automatically freeze account
        if (frozenAccount[_to] == false && whiteList[_to] == false){
            frozenAccount[_to] = true;
            emit FrozenFunds(_to, true);
        }
        return true;
    }

    /**
    * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender when not paused.
    * @param _spender The address which will spend the funds.
    * @param _value The amount of tokens to be spent.
    */
    function approve(address _spender, uint256 _value) public returns (bool) {
        return super.approve(_spender, _value);
    }

    function allowance(address _owner, address _spender) public constant returns (uint256) { // solium-disable-line no-constant
        return super.allowance(_owner,_spender);
    }

}
