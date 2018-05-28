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
	DataDirectory.setProvider(web3.currentProvider);

	dataDirectory = await DataDirectory.new({from: mainAccount, gas: 2000000});
	console.log(dataDirectory);
}



async function deploy() {
	await deployDataDirectory();
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

      deploy();


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
	var parent = $('#' + parentId);
	var elem = $('<li><div class="collapsible-header"><i class="material-icons">folder_item</i>'
	         + title + '</div><div class="collapsible-body"><div class="row"><div class="col s12 m12">'
					 + '<ul id="' + id + '" class="collapsible" data-collapsible="accordion">');
	parent.append(elem);
	rebuildCollapsible();
};


