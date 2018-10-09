var MintController = artifacts.require('minting/MintController');
var FiatToken = artifacts.require('FiatTokenV1');

var BigNumber = require('bignumber.js');
var tokenUtils = require('./../TokenTestUtils');
var checkMINTp0 = tokenUtils.checkMINTp0;
var expectRevert = tokenUtils.expectRevert;
var expectJump = tokenUtils.expectJump;
var bigZero = tokenUtils.bigZero;
var maxAmount = tokenUtils.maxAmount;

var clone = require('clone');

var mintUtils = require('./MintControllerUtils.js');
var AccountUtils = require('./../AccountUtils.js');
var Accounts = AccountUtils.Accounts;
var AccountPrivateKeys = AccountUtils.AccountPrivateKeys;
var getAccountState = AccountUtils.getAccountState;
var MintControllerState = AccountUtils.MintControllerState;
var initializeTokenWithProxyAndMintController = mintUtils.initializeTokenWithProxyAndMintController;
var checkMintControllerState = mintUtils.checkMintControllerState;

var zeroAddress = "0x0000000000000000000000000000000000000000";

var abiUtils = require('./../ABIUtils');
var makeRawTransaction = abiUtils.makeRawTransaction;
var sendRawTransaction = abiUtils.sendRawTransaction;
var msgData = abiUtils.msgData;
var msgData1 = abiUtils.msgData1;

async function run_tests(newToken, accounts) {

    beforeEach('Make fresh token contract', async function () {
        rawToken = await newToken();
        tokenConfig = await initializeTokenWithProxyAndMintController(rawToken);
        token = tokenConfig.token;
        mintController = tokenConfig.mintController;
        expectedMintControllerState = clone(tokenConfig.customState);
        expectedTokenState = [{ 'variable': 'masterMinter', 'expectedValue': mintController.address }];
    });

    it('abi100 internal_setMinterAllowance is internal', async function () {
        await mintController.configureController(Accounts.controller1Account, Accounts.minterAccount, {from: Accounts.mintOwnerAccount});
        let badData = msgData1('internal_setMinterAllowance(address,uint256)', Accounts.controller1Account, 569);
        let raw = makeRawTransaction(
             badData,
             Accounts.mintOwnerAccount,
             AccountPrivateKeys.mintOwnerPrivateKey,
             mintController.address);
         await expectRevert(sendRawTransaction(raw));
    });

    it('abi101 setOwner is internal', async function () {
        let badData = msgData('setOwner(address)', Accounts.arbitraryAccount);
        let raw = makeRawTransaction(
            badData,
            Accounts.mintOwnerAccount,
            AccountPrivateKeys.mintOwnerPrivateKey,
            mintController.address);
        await expectRevert(sendRawTransaction(raw));
    });

}

var testWrapper = require('./../TestWrapper');
testWrapper.execute('MINTp0_ABITests', run_tests);

module.exports = {
  run_tests: run_tests,
}