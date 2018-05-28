var DataDirectory = artifacts.require("DataDirectory");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('Data Directory', function([owner]) {
	var dataDirectory;

	before("deploy DataDirectory", async function() {
		dataDirectory = await DataDirectory.new();
	});


	it("should initially not have any elements", async function() {
		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(0);
	});


	it("should add first root child", async function() {
		await dataDirectory.addElement("root", "Validations");

		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(1);
		(await dataDirectory.getChildNameAt("root", 0)).should.be.equal("Validations");
	});


	it("should add second root child", async function() {
		await dataDirectory.addElement("root", "Donations");

		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(2);
		(await dataDirectory.getChildNameAt("root", 1)).should.be.equal("Donations");
	});


	it("should add third root child", async function() {
		await dataDirectory.addElement("root", "Outcomes");

		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(3);
		(await dataDirectory.getChildNameAt("root", 2)).should.be.equal("Outcomes");
	});

});
