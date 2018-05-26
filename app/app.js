// Import the page's CSS. Webpack will know what to do with it.
import "./stylesheets/app.css";

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

      //mapAccounts(accs);

      //deploy();


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


