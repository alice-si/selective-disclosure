var DataAccess = artifacts.require("DataAccess");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('Data Access', function([owner]) {
	var dataAccess;

	before("deploy DataAccess", async function() {
		dataAccess = await DataAccess.new();
	});


	it("should grant access", async function() {
		await dataAccess.changeAccess("directory", "group", true, true, true);

		var access = await dataAccess.checkAccess("directory", "group");

		(access).should.be.deep.equal([true, true, true]);
	});


	it("should revoke access", async function() {
		await dataAccess.changeAccess("directory", "group", false, false, false);

		var access = await dataAccess.checkAccess("directory", "group");

		(access).should.be.deep.equal([false, false, false]);
	});

});
