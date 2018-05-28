pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DataDirectory is Ownable {

    mapping (bytes32 => bytes32) public elements;
    uint256 count;

    function addElement(bytes32 parent, bytes32 name) onlyOwner {
        elements[parent] = name;
        count = count + 1;
    }

}