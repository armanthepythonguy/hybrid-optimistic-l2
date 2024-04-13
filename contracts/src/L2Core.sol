 // SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

//Deployed address :- 0x9008F54C49723d5cfeBBDC7224858eCA6955e61e

contract L2Core{

    mapping (uint256 => bytes) public states;
    bytes public currentState;
    address public sequencer;

    modifier onlySequencer(){
        require(msg.sender == sequencer, "Invalid Accesss !!! Only sequencer can update state");
        _;
    }

    constructor(){
        sequencer = msg.sender;
    }

    function updateState(bytes memory _newState) external onlySequencer(){
        states[block.number] = _newState;
        currentState = _newState;
    }

}