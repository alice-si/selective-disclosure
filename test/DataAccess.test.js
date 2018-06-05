var DataAccess = artifacts.require("DataAccess");
var DataDirectory = artifacts.require("DataDirectory");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('Data Access', function([owner]) {
	var dataAccess, dataDirectory;
	var childId;

	before("deploy DataAccess", async function() {
		dataDirectory = await DataDirectory.new();
		dataAccess = await DataAccess.new(dataDirectory.address);
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


	it("should check recursive access", async function() {
		await dataDirectory.addElement("root", "child", true);
		childId = await dataDirectory.getElementId("root", "child");

		await dataAccess.changeAccess("root", "group", true, true, false);

		var access = await dataAccess.recursivelyCheckAccess(childId, "group");
		(access).should.be.deep.equal([true, true, false]);
	});


	it("should check recursive access and merge", async function() {
		await dataDirectory.addElement(childId, "grand-child", true);
		var grandChildId = await dataDirectory.getElementId(childId, "grand-child");


		await dataAccess.changeAccess("root", "group", true, false, false);
		await dataAccess.changeAccess(childId, "group", false, true, false);

		var access = await dataAccess.recursivelyCheckAccess(grandChildId, "group");

		(access).should.be.deep.equal([true, true, false]);
	});


	it("should return empty access for not existing entry", async function() {
		var access = await dataAccess.checkAccess("void", "unknown");

		(access).should.be.deep.equal([false, false, false]);
	});

});
