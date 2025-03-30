// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WildlifeDonation {
    IERC20 public token;  // ERC-20 Token used for donations
    address public owner;
    uint256 public totalDonated;
    uint256 public speciesProtected;

    event DonationReceived(address indexed donor, uint256 amount);
    event SpeciesProtectedUpdated(uint256 newCount);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        owner = msg.sender;
    }

    function donate(uint256 _amount) external {
        require(_amount > 0, "Donation amount must be greater than zero");

        // Transfer tokens from the sender to the contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        totalDonated += _amount;
        emit DonationReceived(msg.sender, _amount);
    }

    function updateSpeciesProtected(uint256 _newCount) external {
        require(msg.sender == owner, "Only the owner can update species count");
        speciesProtected = _newCount;
        emit SpeciesProtectedUpdated(_newCount);
    }
}