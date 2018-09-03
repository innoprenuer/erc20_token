App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Token.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TokenArtifact = data;
      App.contracts.Token = TruffleContract(TokenArtifact);
      // Set the provider for our contract.
      App.contracts.Token.setProvider(App.web3Provider);
      //update addresses stats
      App.getAddresses();
      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#whiteListButton', App.handleWhiteList);
    $(document).on('click', '#unfreezeButton', App.handleUnfreeze);
    $(document).on('click', '#unwhiteListButton', App.handleUnWhiteList);
    $(document).on('click', '#freezeButton', App.handleFreeze);
  },

  handleUnfreeze: function(event) {
    event.preventDefault();

    var toAddress = $('#TTTransferAddress').val();
    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;

        return TokenInstance.freezeAccount(toAddress, false, {from: account});
      }).then(function(result) {
        alert('unfreeze account Successful!');
        App.getAddresses();
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleFreeze: function(event) {
    event.preventDefault();

    var toAddress = $('#TTTransferAddress').val();
    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;

        return TokenInstance.freezeAccount(toAddress, true, {from: account});
      }).then(function(result) {
        alert('freeze account Successful!');
        App.getAddresses();
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleWhiteList: function(event) {
    event.preventDefault();

    var toAddress = $('#TTTransferAddress').val();
    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;

        return TokenInstance.setWhiteList(toAddress, true, {from: account});
      }).then(function(result) {
        alert('setWhiteList Successful!');
        App.getAddresses();
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleUnWhiteList: function(event) {
    event.preventDefault();

    var toAddress = $('#TTTransferAddress').val();
    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;

        return TokenInstance.setWhiteList(toAddress, false, {from: account});
      }).then(function(result) {
        alert('unset whitelist Successful!');
        App.getAddresses();
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#TTTransferAmount').val());
    var toAddress = $('#TTTransferAddress').val();

    console.log('Transfer ' + amount + ' MKT to ' + toAddress);

    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;

        return TokenInstance.transfer(toAddress, amount, {from: account});
      }).then(function(result) {
        alert('Transfer Successful!');
        App.getAddresses();
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function() {
    console.log('Getting balances...');

    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Token.deployed().then(function(instance) {
        TokenInstance = instance;

        return TokenInstance.balanceOf(account);
      }).then(function(result) {
        balance = result.c[0];

        $('#TTBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getAddresses: function() {
    console.log('Getting addresses...');

    var TokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
     
      App.contracts.Token.deployed()
      .then(function(instance) {
        TokenInstance = instance;
        return TokenInstance.getAccountList();
      })
      .then(function(addresses) {
    
        whitelistPromises = [];
        frozenPromises = [];
        AreFrozenAccounts = [];
      
        //call to get frozen accounts
        addresses.forEach(addr => {
          return frozenPromises.push(TokenInstance.frozenAccount.call(addr)); 
        })
    
        Promise.all(frozenPromises)
        .then(
          function(frozenAccounts) {
            console.log("Resolved frozen promises...");
            //copy frozen accounts to global array
            AreFrozenAccounts = frozenAccounts.slice();
            //call to get whitelisted accounts
            addresses.forEach(address => {
              return whitelistPromises.push(TokenInstance.whiteList.call(address));
            })
            return Promise.all(whitelistPromises);
          })
        .then(function(isWhitelistedAddress){
          console.log("Resolved whitelisted addreses...");
          console.log("Will create table with data..");
          console.log(AreFrozenAccounts);
          console.log(isWhitelistedAddress);
          console.log(addresses);

          //clear previous data
          $('.row22').remove();
          //create table and put data here
          for (var i = 0; i < addresses.length; i++) {
            row = $('<tr></tr>').addClass('row22');
            rowHead = $('<th></th>').attr('scope', 'row').text(i+1);
            rowDataAddr = $('<td></td>').text(addresses[i]);
            rowDataWhitelist = $('<td></td>').text(isWhitelistedAddress[i]);
            rowDataFrozen = $('<td></td>').text(AreFrozenAccounts[i]);
            row.append(rowHead);
            row.append(rowDataAddr);
            row.append(rowDataWhitelist);
            row.append(rowDataFrozen);
            console.log(row)
            $('#StatsTableBody').append(row);  
        }
        })
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
