/*jslint node: true */
"use strict";

// var fs = require('fs');
var crypto = require('crypto');
var Mnemonic = require('bitcore-mnemonic');
var Bitcore = require('bitcore-lib');
var objectHash = require('bng-core/object_hash');
// var device = require('bng-core/device.js');
// var walletDefinedByKeys = require('bng-core/wallet_defined_by_keys.js');
// var network = require('bng-core/network.js');
// var configPath = "../wallets/";
// var wallet;

function onError(err) {
    if (err) {
        throw Error(err);
    }
}


function derivePubkey(xPubKey, path) {
    var hdPubKey = new Bitcore.HDPublicKey(xPubKey);
    return hdPubKey.derive(path).publicKey.toBuffer().toString("base64");
}


/**
 wallet example:
 "passphrase": "",
 "mnemonic_phrase": "industry expect outer unique utility scan umbrella solid round battle enemy danger",
 "temp_priv_key": "N7JUkRsOaxlUQ+/8IhT+r2e1HHrXI6TrxsaiNBsiCEo=",
 "prev_temp_priv_key": "7spdl99kigmnni1WyTjCMjKQ7ziooaDRFxpO84+LstY=",

 "address": "JDKPTX4UEZ4A6LRYBVYBX3BYIYADDAQS",
 "wallet": "yM2SBBJXEgja7lMMSVuCAqioiGYJ3+GYVO0ZOSOe2CM=",
 "is_change": 0,
 "address_index": 0,
 "definition": ["sig",{"pubkey":"AwnOX+2ycbnzUVPHeMTBQlnqWuMTa9jqNBDLbtT2wOLe"}],
 "creation_date": "2017-10-25 02:17:31"
 **/
function createWallet(mnemonic_phrase) {
    var deviceTempPrivKey = crypto.randomBytes(32);
    var devicePrevTempPrivKey = crypto.randomBytes(32);
    var passphrase = "";
    var mnemonic;
    if (mnemonic_phrase) {
        mnemonic = new Mnemonic(mnemonic_phrase);
    } else {
        mnemonic = new Mnemonic(); // generates new mnemonic
        while (!Mnemonic.isValid(mnemonic.toString()))
            mnemonic = new Mnemonic();
    }
    var xPrivKey = mnemonic.toHDPrivateKey(passphrase);
    var strXPubKey = Bitcore.HDPublicKey(xPrivKey.derive("m/44'/0'/0'")).toString();
    var pubkey = derivePubkey(strXPubKey, "m/" + 0 + "/" + 0);
    var arrDefinition = ['sig', {pubkey: pubkey}];
    var address = objectHash.getChash160(arrDefinition);
    var wallet = crypto.createHash("sha256").update(strXPubKey, "utf8").digest("base64");
    // var devicePrivKey = xPrivKey.derive("m/1'").privateKey.bn.toBuffer({size: 32});
    // device.setDevicePrivateKey(devicePrivKey); // we need device address before creating a wallet
    var obj = {};
    obj['passphrase'] = passphrase;
    obj['mnemonic_phrase'] = mnemonic.phrase;
    obj['temp_priv_key'] = deviceTempPrivKey.toString('base64');
    obj['prev_temp_priv_key'] = devicePrevTempPrivKey.toString('base64');
    obj['address'] = address;
    obj['wallet'] = wallet;
    obj['is_change'] = 0;
    obj['address_index'] = 0;
    obj['definition'] = arrDefinition;


    return obj;
    //console.log(JSON.stringify(obj));
}

function signWithLocalPrivateKey(mnemonic_phrase, passphrase, account, is_change, address_index) {
  var mnemonic = new Mnemonic(mnemonic_phrase);
  var xPrivKey = mnemonic.toHDPrivateKey(passphrase);
  var path = "m/44'/0'/" + account + "'/" + is_change + "/" + address_index;
  var privateKey = xPrivKey.derive(path).privateKey;
  var privKeyBuf = privateKey.bn.toBuffer({size: 32}); // https://github.com/bitpay/bitcore-lib/issues/47
  return privKeyBuf;
}

// function create(strXPubKey, callbacks) {
//     walletDefinedByKeys.createWalletByDevices(strXPubKey, 0, 1, [], "wallet", false, function (walletid) {
//     });
// }

// function scanForAddresses(mnemonic, cb) {
//     var xPrivKey = new Mnemonic(mnemonic).toHDPrivateKey();
//     var currentWalletIndex = 0;
//     var xPubKey = Bitcore.HDPublicKey(xPrivKey.derive("m/44'/0'/" + currentWalletIndex + "'"));
//     var assocMaxAddressIndexes = {};
//     var is_change = 0;
//     if (!assocMaxAddressIndexes[currentWalletIndex]) assocMaxAddressIndexes[currentWalletIndex] = {
//         main: 0,
//         change: 0
//     };
//     var arrTmpAddresses = [];
//     for (var i = 0; i < 20; i++) {
//         var index = (is_change ? assocMaxAddressIndexes[currentWalletIndex].change : assocMaxAddressIndexes[currentWalletIndex].main) + i;
//         arrTmpAddresses.push(objectHash.getChash160(["sig", {"pubkey": derivePubkey(xPubKey, 'm/' + is_change + '/' + index)}]));
//     }
//     cb(arrTmpAddresses);
// }

// createWallet();
// createWallet("label media profit swarm flame injury tiny scan bottom warfare royal original");
// create config files for wallet
// function createConfig(deviceName, isWitness) {
//     // create the wallet
//     var wallet = createWallet();
//     if (isWitness) {
//         witnessConfigArray.push(wallet);
//     }
//
//     // create directory
//     var dir = configPath+deviceName;
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//     }
//
//     // write keys
//     var keys = {};
//     keys['mnemonic_phrase'] = wallet['mnemonic_phrase'];
//     keys['temp_priv_key'] = wallet['temp_priv_key'];
//     keys['prev_temp_priv_key'] = wallet['prev_temp_priv_key'];
//     fs.writeFile(dir+"/keys.json", JSON.stringify(keys, null, '\t'), 'utf8', onError);
//
//     // write devicename
//     var cfg = {};
//     cfg['deviceName'] = deviceName;
//     fs.writeFile(dir+"/conf.json", JSON.stringify(cfg, null, '\t'), 'utf8', onError);
//
//     return wallet;
// }

// create config files for paying address
// console.log("> Create wallets for paying...");
// wallet = createConfig("wallet-paying", 0);
// fs.writeFile(configPath+"paying-config.json", JSON.stringify(wallet, null, '\t'), 'utf8', onError);

// create config files for payee address
// console.log("> Create wallets for payee...");
// wallet = createConfig("wallet-payee", 0);
// fs.writeFile(configPath+"payee-config.json", JSON.stringify(wallet, null, '\t'), 'utf8', onError);

// console.log("Done!");
