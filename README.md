# Selective Disclosure Access Management App


This project is a collection of smart contracts with a UI (Dapp) that manages data access logic for sensitive information.


### Installation
This project requires [node-js](https://github.com/nodejs/node) runtime and uses [truffle](https://github.com/trufflesuite/truffle) as the Ethereum smart contract development framework.

In order to run it, install truffle first:

    npm install -g truffle

Then install all of the node-js dependencies

    npm install

Connection to blockchain node is defined in truffle.js:

    networks: {
        development: {
    	    host: 'localhost',
    		port: 8545,
    		network_id: '*'
    	}
    }

We recommend using popular Ethereum test client [ganache-cli](https://github.com/trufflesuite/ganache-cli) as a default node:

    npm install -g ganache-cli

### Demo dApp

We created a demo dApp so you can interact and test the smart contracts in a visual environment rather than hacking console scripts.
To run this mode, compile all of the smart contracts first:

    truffle compile

... and then launch a demo server:

    npm run dev

## Contributions

All comments and ideas for improvements and pull requests are welcomed. We want to improve the project based on feedback from the community.

## License

MIT License

Copyright (c) 2017 Alice Ltd. (Jakub Wojciechowski jakub@alice.si)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
