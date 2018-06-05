// Import the page's CSS. Webpack will know what to do with it.
import "./stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import dataDirectory_artifacts from '../build/contracts/DataDirectory.json';
import usersDirectory_artifacts from '../build/contracts/UsersDirectory.json';
import dataAccess_artifacts from '../build/contracts/DataAccess.json';

// Create contract object
var DataDirectory = contract(dataDirectory_artifacts);
var UsersDirectory = contract(usersDirectory_artifacts);
var DataAccess = contract(dataAccess_artifacts);

// Contract instance
var dataDirectory;
var usersDirectory;
var dataAccess;


//Accounts
var mainAccount;

var events;


async function deployDataDirectory() {
	dataDirectory = await DataDirectory.new({from: mainAccount, gas: 2000000});
	console.log("Deployed data directory: " + dataDirectory.address);
	localStorage.setItem('dataDirectoryAddress', dataDirectory.address);
	await dataDirectory.addElement("root", "Validations", true, {from: mainAccount, gas: 2000000});
	await dataDirectory.addElement("root", "Donations", true, {from: mainAccount, gas: 2000000});
	await dataDirectory.addElement("root", "Outcomes", true, {from: mainAccount, gas: 2000000});

	var donationsId = await dataDirectory.getElementId("root", "Validations");

	await dataDirectory.addElement(donationsId, "St. Mungos", true, {from: mainAccount, gas: 2000000});
	await dataDirectory.addElement(donationsId, "Fusion Housing", true, {from: mainAccount, gas: 2000000});
}

async function deployUsersDirectory() {
	usersDirectory = await UsersDirectory.new({from: mainAccount, gas: 2000000});
	console.log("Deployed users directory: " + usersDirectory.address);
	localStorage.setItem('usersDirectoryAddress', usersDirectory.address);
	await usersDirectory.addElement("root-users", "Project Managers", {from: mainAccount, gas: 2000000});
	await usersDirectory.addElement("root-users", "Judges", {from: mainAccount, gas: 2000000});
	await usersDirectory.addElement("root-users", "Donors", {from: mainAccount, gas: 2000000});
}

async function deployDataAccess() {
	dataAccess = await DataAccess.new({from: mainAccount, gas: 2000000});
	console.log("Deployed dataAccess: " + dataAccess.address);
	localStorage.setItem('dataAccessAddress', dataAccess.address);
}

async function addDataElement(parentId, fullName) {
	console.log("Adding: " + fullName + " to parent: " + parentId);
	await dataDirectory.addElement(parentId, fullName, true, {from: mainAccount, gas: 2000000});
	var elementId = await dataDirectory.getElementId(parentId, fullName);
	addDataDirectoryFolder(parentId, fullName, elementId);
	listenToEvents();
};

async function addUserElement(parentId, address) {
	console.log("Adding user: " + address + " to parent: " + parentId);
	await usersDirectory.addUser(parentId, address, {from: mainAccount, gas: 2000000});
	addDirectoryElement(parentId, address);
	listenToEvents();
};

async function grantAccess(folder, group, read, write, admin) {
	await dataAccess.changeAccess(folder, group, read, write, admin, {from: mainAccount, gas: 2000000});
	M.toast({html: "Access granted for: " + folder + " to: " + group + " [ read: " + read + " write: " + write + " admin: " + admin + " ]"})
}


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



async function fetchUsersDirectory(elementId, parentId) {
	if (parentId) {
		var fullName = await usersDirectory.getFullName(elementId);
		addUserDirectoryFolder(parentId, fullName, elementId);
	}
	var childCount = await usersDirectory.getChildrenCount(elementId);
	for(var i=0; i<childCount.valueOf(); i++) {
		var childId = await usersDirectory.getChildIdAt(elementId, i);
		fetchUsersDirectory(childId, elementId);
	}
	var usersCount = await usersDirectory.getUsersCount(elementId);
	for(var i=0; i<usersCount.valueOf(); i++) {
		var address = await usersDirectory.getUserAt(elementId, i);
		addDirectoryElement(elementId, address);
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
}


async function getDataAccess() {
	DataAccess.setProvider(web3.currentProvider);
	var address = localStorage.getItem('dataAccessAddress');
	if (address) {
		dataAccess = await DataAccess.at(address);
	} else {
		await deployDataDirectory();
	}
}

async function getContracts() {
	await getDataAccess();
	await getUsersDirectory();
	await getDataDirectory();

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
	await fetchUsersDirectory("root-users");

}

function listenToEvents() {

	dataDirectory.AddedElement({}, {fromBlock:1, toBlock:'latest'}).get(function(error, results) {
		results.forEach(function(result) {
			var event = {
				block: result.blockNumber,
				tx: result.transactionHash,
				desc: "A new element " + result.args.fullName + " has been added to the data node " + result.args.parentId + " by the admin " + result.args.user + "]"
			};
			displayEvent(event);
		});
	});

	usersDirectory.AddedUser({}, {fromBlock:1, toBlock:'latest'}).get(function(error, results) {
		results.forEach(function(result) {
			var event = {
				block: result.blockNumber,
				tx: result.transactionHash,
				desc: "A user " + result.args.user + " has been added to the folder " + result.args.parentId + " by the admin " + result.args.admin + "]"
			};
			displayEvent(event);
		});
	});

	dataAccess.AccessChanged({}, {fromBlock:1, toBlock:'latest'}).get(function(error, results) {
		console.log(results);
		results.forEach(function(result) {
			var event = {
				block: result.blockNumber,
				tx: result.transactionHash,
				desc: "A group " + result.args.group
				+ " has been given <br/> [ read: " + result.args.read
				+ ", write: " + result.args.write
				+ ", admin: " + result.args.admin
				+ " ] access to the folder: " + result.args.directory
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

			getContracts();

	});




};

var rebuildCollapsible = function() {
	var elems = document.querySelectorAll('.collapsible');
	M.Collapsible.init(elems);

	var elems = document.querySelectorAll('select');
	M.FormSelect.init(elems);
};

document.addEventListener('DOMContentLoaded', function () {
  rebuildCollapsible();
});

window.addDirectoryElement = function(parentId, title, body) {
	var parent = $('#' + parentId);
	var elem = $('<li><div class="collapsible-header"><i class="material-icons" style="color: #1998a2;">person</i>'
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
	var elem = $('<li><div class="collapsible-header" onclick="selectDataFolder(&apos;' + id +'&apos;, &apos;' + title +'&apos;)"><i class="material-icons">' + (defaultIcons[title] || 'folder_item') + '</i>'
	         + title + '</div><div class="collapsible-body"><div class="row"><div class="col s12 m12">'
					 + '<ul id="' + id + '" class="collapsible" data-collapsible="accordion"></ul>'
					 + '<div class="input-field col s6" style="margin:0;"><input id="input_' + id +'" type="text" class="validate" style="height: 2.5rem;"><label for="name">Subfolder name</label></div>'
		       + '<a class="waves-effect waves-light btn" onclick="addElement(&apos;' + id +'&apos;)"><i class="material-icons right">add_circle</i>add folder</a>'
		       + '</div></div>');
	parent.append(elem);
	rebuildCollapsible();
};

window.addUserView = function(parentId, address) {
	var parent = $('#users_' + parentId);
	console.log(parent);
	var elem = $('<div><i class="material-icons">person</i>' + address + '</div>');
	parent.prepend(elem);
};

window.addUserDirectoryFolder = function(parentId, title, id) {
	var defaultIcons = {
		'Project Managers' : 'work',
		'Judges' : 'account_balance',
		'Donors' : 'face'
	};

	$("#selectedGroup").append('<option value="' + id + '">' + title + '</option>');

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
	deployDataAccess();
};

window.addElement = function(parentId) {
	var elem = $("#input_" + parentId);
	var fullName = elem.val();
	$("#input_" + parentId).val("");
	console.log(fullName);

	addDataElement(parentId, fullName);
};

window.addUser = function(parentId) {
	var elem = $("#input_" + parentId);
	var address = elem.val();
	$("#input_" + parentId).val("");
	console.log("Adding: " + address + " to: " + parentId);

	addUserElement(parentId, address);
};

var selectAccesses = function(accesses) {
	$('#readAccess').prop('checked', accesses[0]);
	$('#writeAccess').prop('checked', accesses[1]);
	$('#adminAccess').prop('checked', accesses[2]);
};

window.selectDataFolder = function(id, title) {
	console.log("Select: " + id + title);
	$("#currentFolder").val(title);

	//Clear selected group
	$("#selectedGroup").val(0);
	M.FormSelect.init($("#selectedGroup"));

	//Clear access
	selectAccesses([false, false, false]);
};

window.onGroupChange = function() {
	var folder = $("#currentFolder").val();
	var group = $('#selectedGroup').find(":selected").val();
	if (folder && group) {
		dataAccess.checkAccess(folder, group).then(function(result) {
			selectAccesses(result);
		})
	}
};

window.grantAccess = function() {
  var folder = $("#currentFolder").val();
  var group = $('#selectedGroup').find(":selected").val();
  var read = $('#readAccess:checked').val() == 'on';
  var write = $('#writeAccess:checked').val() == 'on';
  var admin = $('#adminAccess:checked').val() == 'on';
	grantAccess(folder, group, read, write, admin);
};



