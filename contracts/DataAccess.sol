pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './DataDirectory.sol';


contract DataAccess is Ownable {

    event AccessChanged(bytes32 folder, bytes32 group, bool read, bool write, bool admin, uint256 created, uint256 expires);

    DataDirectory dataDirectory;

    constructor(DataDirectory _dataDirectory) public {
        dataDirectory = _dataDirectory;
    }

    struct Access {
        bool read;
        bool write;
        bool admin;
        uint256 created;
        uint256 expires;
    }

    mapping (bytes32 => mapping(bytes32 => Access)) public rights;
    uint256 count;

    function changeAccess(bytes32 folder, bytes32 group, bool read, bool write, bool admin) public {
        rights[folder][group] = Access(read, write, admin, now, 0);
        emit AccessChanged(folder, group,read, write, admin, now, 0);
    }

    function checkAccess(bytes32 folder, bytes32 group) public view returns(bool[3]) {
        Access memory access = rights[folder][group];
        return [access.read, access.write, access.admin];
    }

    function recursivelyCheckAccess(bytes32 folder, bytes32 group) public view returns(bool[3]) {
        bool[3] memory currentAccess = checkAccess(folder, group);
        if (dataDirectory.hasParent(folder)) {
            bytes32 parentFolder = dataDirectory.getParentId(folder);
            bool[3] memory parentAccess = recursivelyCheckAccess(parentFolder, group);
            return [currentAccess[0] || parentAccess[0], currentAccess[1] || parentAccess[1], currentAccess[2] || parentAccess[2]];
        } else {
            return currentAccess;
        }
    }

}