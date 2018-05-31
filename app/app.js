// Import the page's CSS. Webpack will know what to do with it.
import "./stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import dataDirectory_artifacts from '../build/contracts/DataDirectory.json';
import usersDirectory_artifacts from '../build/contracts/UsersDirectory.json';

// Create contract object
var DataDirectory = contract(dataDirectory_artifacts);
var UsersDirectory = contract(usersDirectory_artifacts);

// Contract instance
var dataDirectory;
var usersDirectory;


//Accounts
var mainAccount;

var events;


async function deployDataDirectory() {
	console.log("Deploying data directory");
	dataDirectory = await DataDirectory.new({from: mainAccount, gas: 2000000});
	localStorage.setItem('dataDirectoryAddress', dataDirectory.address);
	await dataDirectory.addElement("root", "Validations", true, {from: mainAccount, gas: 2000000});
	await dataDirectory.addElement("root", "Donations", true, {from: mainAccount, gas: 2000000});
	await dataDirectory.addElement("root", "Outcomes", true, {from: mainAccount, gas: 2000000});

	var donationsId = await dataDirectory.getElementId("root", "Validations");

	await dataDirectory.addElement(donationsId, "St. Mungos", true, {from: mainAccount, gas: 2000000});
	await dataDirectory.addElement(donationsId, "Fusion Housing", true, {from: mainAccount, gas: 2000000});
}

async function deployUsersDirectory() {
	console.log("Deploying users directory");
	usersDirectory = await UsersDirectory.new({from: mainAccount, gas: 2000000});
	localStorage.setItem('usersDirectoryAddress', usersDirectory.address);
	await usersDirectory.addElement("root-users", "Project Managers", {from: mainAccount, gas: 2000000});
	await usersDirectory.addElement("root-users", "Judges", {from: mainAccount, gas: 2000000});
	await usersDirectory.addElement("root-users", "Donors", {from: mainAccount, gas: 2000000});

	//var donationsId = await dataDirectory.getElementId("root", "Validations");

	//await dataDirectory.addElement(donationsId, "St. Mungos", true, {from: mainAccount, gas: 2000000});
	//await dataDirectory.addElement(donationsId, "Fusion Housing", true, {from: mainAccount, gas: 2000000});
}

async function addDataElement(parentId, fullName) {
	console.log("Adding: " + fullName + " to parent: " + parentId);
	await dataDirectory.addElement(parentId, fullName, true, {from: mainAccount, gas: 2000000});
	var elementId = await dataDirectory.getElementId(parentId, fullName);
	addDataDirectoryFolder(parentId, fullName, elementId);
	listenToEvents();
};


async function fetchDirectory(contract, displayFunc, elementId, parentId) {
	if (parentId) {
		var fullName = await contract.getFullName(elementId);
		displayFunc(parentId, fullName, elementId);
	}
	var childCount = await contract.getChildrenCount(elementId);
	for(var i=0; i<childCount.valueOf(); i++) {
		var childId = await contract.getChildIdAt(elementId, i);
		fetchDirectory(contract, displayFunc, childId, elementId);
	}
}



async function getDataDirectory() {
	DataDirectory.setProvider(web3.currentProvider);
	var address = localStorage.getItem('dataDirectoryAddress');
	if (address) {
		dataDirectory = await DataDirectory.at(address);
	} else {
		await deployDataDirectory();
	}
	await fetchDirectory(dataDirectory, addDataDirectoryFolder, "root");

	listenToEvents();
}


async function getUsersDirectory() {
	UsersDirectory.setProvider(web3.currentProvider);
	var address = localStorage.getItem('usersDirectoryAddress');
	if (address) {
		usersDirectory = await UsersDirectory.at(address);
	} else {
		await deployUsersDirectory();
	}
	await fetchDirectory(usersDirectory, addUserDirectoryFolder, "root-users");

	//listenToEvents();
}

function listenToEvents() {
	//Listen to events
	window.dd = dataDirectory;

	dataDirectory.AddedElement({}, {fromBlock:1, toBlock:'latest'}).get(function(error, results) {
		results.forEach(function(result) {

			var event = {
				block: result.blockNumber,
				tx: result.transactionHash,
				desc: "A new element " + result.args.fullName + " has been added to the node " + result.args.parentId + " by the user " + result.args.user + "]"
			};
			displayEvent(event);
		});
	});
}

window.onload = function() {

	window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));




	web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      mainAccount = accs[0];
		  console.log("Main account: " + mainAccount);

			getDataDirectory();
			getUsersDirectory();

	});




};

var rebuildCollapsible = function() {
	var elems = document.querySelectorAll('.collapsible');
	M.Collapsible.init(elems);
};

document.addEventListener('DOMContentLoaded', function () {
  rebuildCollapsible();
});

window.addDirectoryElement = function(parentId, title, body) {
	var parent = $('#' + parentId);
	var elem = $('<li><div class="collapsible-header"><i class="material-icons">description</i>'
           + title + '</div><div class="collapsible-body"><p>'
           + body + '</p></div></li>');
	parent.append(elem);
	rebuildCollapsible();
};

window.addDataDirectoryFolder = function(parentId, title, id) {
	var defaultIcons = {
		'Validations' : 'check_circle',
		'Donations' : 'money',
		'Outcomes' : 'thumb_up'
	};

	var parent = $('#' + parentId);
	var elem = $('<li><div class="collapsible-header"><i class="material-icons">' + (defaultIcons[title] || 'folder_item') + '</i>'
	         + title + '</div><div class="collapsible-body"><div class="row"><div class="col s12 m12">'
					 + '<ul id="' + id + '" class="collapsible" data-collapsible="accordion"></ul>'
					 + '<div class="input-field col s6" style="margin:0;"><input id="input_' + id +'" type="text" class="validate" style="height: 2.5rem;"><label for="name">Subfolder name</label></div>'
		       + '<a class="waves-effect waves-light btn" onclick="addElement(&apos;' + id +'&apos;)"><i class="material-icons right">add_circle</i>add folder</a>'
		       + '</div></div>');
	parent.append(elem);
	rebuildCollapsible();
};

window.addUserDirectoryFolder = function(parentId, title, id) {
	var defaultIcons = {
		'Project Managers' : 'work',
		'Judges' : 'account_balance',
		'Donors' : 'face'
	};

	var parent = $('#' + parentId);
	var elem = $('<li><div class="collapsible-header"><i class="material-icons">' + (defaultIcons[title] || 'folder_item') + '</i>'
		+ title + '</div><div class="collapsible-body"><div class="row"><div class="col s12 m12">'
		+ '<ul id="' + id + '" class="collapsible" data-collapsible="accordion"></ul>'
		+ '<div class="input-field col s6" style="margin:0;"><input id="input_' + id +'" type="text" class="validate" style="height: 2.5rem;"><label for="address">User address</label></div>'
		+ '<a class="waves-effect waves-light btn" onclick="addUser(&apos;' + id +'&apos;)"><i class="material-icons right">person_add</i>add user</a>'
		+ '</div></div>');
	parent.append(elem);
	rebuildCollapsible();
};

function displayEvent(event) {
	console.log("Displaying: " + event);
	var shortTx = event.tx.substr(0, 20) + '...';
	var elem = $('<tr><td>' + event.block + '</td><td>' + shortTx + '</td><td>' + event.desc + '</td></tr>');
	$('#logs-table').prepend(elem);
}

window.drawDataDirectory = function() {
	addDirectoryFolder("root", "Validations", "a1");
	addDirectoryFolder("a1", "St. Mungos", "b1");
	addDirectoryFolder("a1", "Fusion Housing", "b2");
	addDirectoryFolder("root", "Donations", "a2");
	addDirectoryFolder("root", "Outcomes", "a3");
};

window.redeploy = function() {
	deployDataDirectory();
	deployUsersDirectory();
};

window.addElement = function(parentId) {
	var elem = $("#input_" + parentId);
	var fullName = elem.val();
	console.log(fullName);

	addDataElement(parentId, fullName);
};

window.addUser = function(parentId) {
	var elem = $("#input_" + parentId);
	var address = elem.val();
	$("#input_" + parentId)
	console.log("Adding: " + address + " to: " + parentId);

	addUserElement(parentId, address);
};


