pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract DataAccess is Ownable {

    event AccessChanged(bytes32 directory, bytes32 group, bool read, bool write, bool admin, uint256 created, uint256 expires);

    struct Access {
        bool read;
        bool write;
        bool admin;
        uint256 created;
        uint256 expires;
    }

    mapping (bytes32 => mapping(bytes32 => Access)) public rights;
    uint256 count;

    function changeAccess(bytes32 directory, bytes32 group, bool read, bool write, bool admin) public onlyOwner {
        rights[directory][group] = Access(read, write, admin, now, 0);
        emit AccessChanged(directory, group,read, write, admin, now, 0);
    }

    function checkAccess(bytes32 directory, bytes32 group) public view returns(bool[3]) {
        Access memory access = rights[directory][group];
        return [access.read, access.write, access.admin];
    }

}