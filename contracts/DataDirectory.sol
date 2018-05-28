pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DataDirectory is Ownable {

    struct Element {
        bytes32 parentId;
        bytes reference;
        string fullName;
        bytes32[] children;
    }

    mapping (bytes32 => Element) public elements;
    uint256 count;


    constructor() public {
        elements[keccak256("root")].parentId = 1;
    }

    function addElement(bytes32 parentName, string fullName) onlyOwner {
        bytes32 id = keccak256(fullName);
        bytes32 parentId = keccak256(parentName);
        require(elements[id].parentId == 0);
        elements[id].parentId = parentId;
        elements[id].fullName = fullName;
        elements[parentId].children.push(id);
    }

    function getChildrenCount(bytes32 parentName) public view returns(uint256) {
        return elements[keccak256(parentName)].children.length;
    }

    function getChildNameAt(bytes32 parentName, uint256 index) public view returns(string) {
        bytes32 id = elements[keccak256(parentName)].children[index];
        return elements[id].fullName;
    }

}