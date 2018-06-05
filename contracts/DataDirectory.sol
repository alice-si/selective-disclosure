pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DataDirectory is Ownable {

    event AddedElement(address user, bytes32 parentId, string fullName);

    struct Element {
        bytes32 parentId;
        bytes reference;
        string fullName;
        bool isFolder;
        bytes32[] children;
    }

    mapping (bytes32 => Element) public elements;
    uint256 count;


    constructor() public {
        elements["root"].parentId = 0x1;
    }

    function getElementId(bytes32 parentId, string fullName) public pure returns(bytes32) {
        return keccak256(fullName);
    }

    function addElement(bytes32 parentId, string fullName, bool isFolder) public onlyOwner {
        bytes32 id = this.getElementId(parentId, fullName);
        require(elements[id].parentId == 0);
        elements[id].parentId = parentId;
        elements[id].fullName = fullName;
        elements[id].isFolder = isFolder;
        elements[parentId].children.push(id);
        emit AddedElement(msg.sender, parentId, fullName);
    }

    function getChildrenCount(bytes32 elementId) public view returns(uint256) {
        return elements[elementId].children.length;
    }

    function isFolder(bytes32 elementId) public view returns(bool) {
        return elements[elementId].isFolder;
    }

    function getFullName(bytes32 elementId) public view returns(string) {
        return elements[elementId].fullName;
    }

    function getChildIdAt(bytes32 elementId, uint256 index) public view returns(bytes32) {
        return elements[elementId].children[index];
    }

    function getParentId(bytes32 elementId) public view returns(bytes32) {
        return elements[elementId].parentId;
    }

    function hasParent(bytes32 elementId) public view returns(bool) {
        return getParentId(elementId) != 0x1;
    }

}