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
