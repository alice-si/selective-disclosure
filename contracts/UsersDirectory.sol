pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract UsersDirectory is Ownable {

    event AddedElement(address user, bytes32 parentId, string fullName);
    event AddedUser(address admin, bytes32 parentId, address user);

    struct Element {
        bytes32 parentId;
        string fullName;
        bytes32[] children;
        address[] users;
    }

    mapping (bytes32 => Element) public elements;
    uint256 count;


    constructor() public {
        elements["root-users"].parentId = 0x1;
    }

    function getElementId(bytes32 parentId, string fullName) public pure returns(bytes32) {
        return keccak256(fullName);
    }

    function addElement(bytes32 parentId, string fullName) public {
        bytes32 id = this.getElementId(parentId, fullName);
        require(elements[id].parentId == 0);
        elements[id].parentId = parentId;
        elements[id].fullName = fullName;
        elements[parentId].children.push(id);
        emit AddedElement(msg.sender, parentId, fullName);
    }

    function getChildrenCount(bytes32 elementId) public view returns(uint256) {
        return elements[elementId].children.length;
    }

    function getFullName(bytes32 elementId) public view returns(string) {
        return elements[elementId].fullName;
    }

    function getChildIdAt(bytes32 elementId, uint256 index) public view returns(bytes32) {
        return elements[elementId].children[index];
    }

    function addUser(bytes32 elementId, address user) public {
        elements[elementId].users.push(user);
        emit AddedUser(msg.sender, elementId, user);
    }

    function getUsersCount(bytes32 elementId) public view returns(uint256) {
        return elements[elementId].users.length;
    }

    function getUserAt(bytes32 elementId, uint256 index) public view returns(address) {
        return elements[elementId].users[index];
    }

}