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
		await dataDirectory.addElement("root", "Validations", true);

		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(1);
		var childId = await dataDirectory.getChildIdAt("root", 0);
		(await dataDirectory.getFullName(childId)).should.be.equal("Validations");
		(await dataDirectory.isFolder(childId)).should.be.equal(true);
	});


	it("should add second root child", async function() {
		await dataDirectory.addElement("root", "Donations", true);

		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(2);
		var childId = await dataDirectory.getChildIdAt("root", 1);
		(await dataDirectory.getFullName(childId)).should.be.equal("Donations");
		(await dataDirectory.isFolder(childId)).should.be.equal(true);
	});


	it("should add second root child", async function() {
		await dataDirectory.addElement("root", "Outcomes", true);

		(await dataDirectory.getChildrenCount("root")).should.be.bignumber.equal(3);
		var childId = await dataDirectory.getChildIdAt("root", 2);
		(await dataDirectory.getFullName(childId)).should.be.equal("Outcomes");
		(await dataDirectory.isFolder(childId)).should.be.equal(true);
	});

});
