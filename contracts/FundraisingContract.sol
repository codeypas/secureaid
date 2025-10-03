// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureAidFundraising is ReentrancyGuard, Ownable {
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    struct Campaign {
        string title;
        string description;
        uint256 targetAmount;
        uint256 totalRaised;
        uint256 createdAt;
        bool isActive;
        address beneficiary;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(address => uint256) public donorTotalContributions;
    
    uint256 public campaignCounter;
    uint256 public totalFundsRaised;
    
    event CampaignCreated(uint256 indexed campaignId, string title, uint256 targetAmount);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount, string message);
    event FundsWithdrawn(uint256 indexed campaignId, address indexed beneficiary, uint256 amount);
    event CampaignStatusChanged(uint256 indexed campaignId, bool isActive);
    
    constructor() {}
    
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        address _beneficiary
    ) external onlyOwner returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_beneficiary != address(0), "Invalid beneficiary address");
        
        uint256 campaignId = campaignCounter++;
        
        campaigns[campaignId] = Campaign({
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            totalRaised: 0,
            createdAt: block.timestamp,
            isActive: true,
            beneficiary: _beneficiary
        });
        
        emit CampaignCreated(campaignId, _title, _targetAmount);
        return campaignId;
    }
    
    function donate(uint256 _campaignId, string memory _message) external payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(_campaignId < campaignCounter, "Campaign does not exist");
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        
        Campaign storage campaign = campaigns[_campaignId];
        campaign.totalRaised += msg.value;
        totalFundsRaised += msg.value;
        donorTotalContributions[msg.sender] += msg.value;
        
        campaignDonations[_campaignId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: _message
        }));
        
        emit DonationReceived(_campaignId, msg.sender, msg.value, _message);
    }
    
    function withdrawFunds(uint256 _campaignId) external nonReentrant {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.beneficiary || msg.sender == owner(), "Not authorized to withdraw");
        require(campaign.totalRaised > 0, "No funds to withdraw");
        
        uint256 amount = campaign.totalRaised;
        campaign.totalRaised = 0;
        
        (bool success, ) = payable(campaign.beneficiary).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(_campaignId, campaign.beneficiary, amount);
    }
    
    function toggleCampaignStatus(uint256 _campaignId) external onlyOwner {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        
        campaigns[_campaignId].isActive = !campaigns[_campaignId].isActive;
        emit CampaignStatusChanged(_campaignId, campaigns[_campaignId].isActive);
    }
    
    function getCampaignDetails(uint256 _campaignId) external view returns (Campaign memory) {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        return campaigns[_campaignId];
    }
    
    function getCampaignDonations(uint256 _campaignId) external view returns (Donation[] memory) {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        return campaignDonations[_campaignId];
    }
    
    function getTotalFunds() external view returns (uint256) {
        return totalFundsRaised;
    }
    
    function getDonorList(uint256 _campaignId) external view returns (address[] memory) {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        
        Donation[] memory donations = campaignDonations[_campaignId];
        address[] memory donors = new address[](donations.length);
        
        for (uint256 i = 0; i < donations.length; i++) {
            donors[i] = donations[i].donor;
        }
        
        return donors;
    }
    
    function getActiveCampaigns() external view returns (uint256[] memory) {
        uint256[] memory activeCampaigns = new uint256[](campaignCounter);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < campaignCounter; i++) {
            if (campaigns[i].isActive) {
                activeCampaigns[activeCount] = i;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeCampaigns[i];
        }
        
        return result;
    }
    
    // Emergency function to pause all donations
    function emergencyPause() external onlyOwner {
        for (uint256 i = 0; i < campaignCounter; i++) {
            campaigns[i].isActive = false;
        }
    }
    
    receive() external payable {
        revert("Direct payments not allowed. Use donate function.");
    }
}
