// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Fundraising is Ownable, ReentrancyGuard {
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed to, uint256 amount, uint256 timestamp);

    uint256 private _totalFunds;
    address[] private _donors;
    mapping(address => uint256) public totalDonated;
    mapping(address => bool) private _hasDonated;

    constructor(address initialOwner) Ownable(initialOwner) {}

    // Accept ETH donations
    function donate() external payable nonReentrant {
        require(msg.value > 0, "Donation must be > 0");
        _totalFunds += msg.value;

        if (!_hasDonated[msg.sender]) {
            _hasDonated[msg.sender] = true;
            _donors.push(msg.sender);
        }
        totalDonated[msg.sender] += msg.value;

        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    // View total funds
    function getTotalFunds() external view returns (uint256) {
        return _totalFunds;
    }

    // Get donor addresses (anonymized = addresses only)
    function getDonorList() external view returns (address[] memory) {
        return _donors;
    }

    // Owner withdraw to verified address
    function withdrawFunds(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid recipient");
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds");
        _totalFunds = 0;
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "Withdraw failed");
        emit FundsWithdrawn(to, amount, block.timestamp);
    }

    // Disable receive/fallback to force using donate()
    receive() external payable {
        revert("Use donate()");
    }

    fallback() external payable {
        revert("Use donate()");
    }
}
