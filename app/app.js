// Import the page's CSS. Webpack will know what to do with it.
import "./stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import dataDirectory_artifacts from '../build/contracts/DataDirectory.json';

// Create contract object
var DataDirectory = contract(dataDirectory_artifacts);

// Contract instance
var dataDirectory;


//Accounts
var mainAccount;


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

async function addElement(parentId, fullName) {
	console.log("Adding: " + fullName + " to parent: " + parentId);
	await dataDirectory.addElement(parentId, fullName, true, {from: mainAccount, gas: 2000000});
	var elementId = await dataDirectory.getElementId(parentId, fullName);
	addDirectoryFolder(parentId, fullName, elementId);
};


async function fetchDataDirectory(elementId, parentId) {
	if (parentId) {
		var fullName = await dataDirectory.getFullName(elementId);
		addDirectoryFolder(parentId, fullName, elementId);
	}
	var childCount = await dataDirectory.getChildrenCount(elementId);
	for(var i=0; i<childCount.valueOf(); i++) {
		var childId = await dataDirectory.getChildIdAt(elementId, i);
		fetchDataDirectory(childId, elementId);
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
	await fetchDataDirectory("root");
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

      console.log(accs);

      mainAccount = accs[0];

      getDataDirectory();
    });




};

var rebuildCollapsible = function() {
	var elems = document.querySelectorAll('.collapsible');
	var instances = M.Collapsible.init(elems);
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

window.addDirectoryFolder = function(parentId, title, id) {
	var defaultIcons = {
		'Validations' : 'check_circle',
		'Donations' : 'money',
		'Outcomes' : 'thumb_up'
	};

	var parent = $('#' + parentId);
	var elem = $('<li><div class="collapsible-header"><i class="material-icons">' + (defaultIcons[title] || 'folder_item') + '</i>'
	         + title + '</div><div class="collapsible-body"><div class="row"><div class="col s12 m12">'
					 + '<ul id="' + id + '" class="collapsible" data-collapsible="accordion"></ul>'
					 + '<div class="input-field col s6" style="margin:0;"><input id="input_' + id +'" type="text" class="validate" style="height: 2.5rem;"><label for="name">Name</label></div>'
		       + '<a class="waves-effect waves-light btn" onclick="addElement(&apos;' + id +'&apos;)"><i class="material-icons right">add_circle</i>add</a>'
		       + '</div></div>');
	parent.append(elem);
	rebuildCollapsible();
};

window.drawDataDirectory = function() {
	addDirectoryFolder("root", "Validations", "a1");
	addDirectoryFolder("a1", "St. Mungos", "b1");
	addDirectoryFolder("a1", "Fusion Housing", "b2");
	addDirectoryFolder("root", "Donations", "a2");
	addDirectoryFolder("root", "Outcomes", "a3");
};

window.redeploy = function() {
	deployDataDirectory();
};

window.addElement = function(parentId) {
	var elem = $("#input_" + parentId);
	var fullName = elem.val();
	$("#input_" + parentId)
	console.log(fullName);

	addElement(parentId, fullName);
}


