// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WifiPay {
    address public provider;
    uint public pricePerMinute;

    struct Session {
        uint startTime;
        bool active;
    }

    mapping(address => uint) public balances;
    mapping(address => Session) public sessions;

    event Deposited(address user, uint amount);
    event SessionStarted(address user, uint startTime);
    event SessionEnded(address user, uint duration, uint cost);
    event Withdrawn(address user, uint amount);


    /// @notice Sets initial provider and price per minute
    /// @param _pricePerMinute cost per minute of internet usage
    constructor(uint _pricePerMinute) {
        provider = msg.sender;
        pricePerMinute = _pricePerMinute;
    }


    /// @notice Adds ETH to user balance
    /// Can be used to fund internet usage
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }


    /// @notice Starts internet session for user
    /// Requires user to have positive balance
    function startSession() public {
        require(balances[msg.sender] > 0, "Deposit required");
        require(!sessions[msg.sender].active, "Session already active");

        sessions[msg.sender] = Session(block.timestamp, true);
        emit SessionStarted(msg.sender, block.timestamp);
    }

    /// @notice Ends active session and calculates cost
    /// Deducts balance and pays provider
    function endSession() public {
        Session storage session = sessions[msg.sender];
        require(session.active, "No active session");

        uint duration = (block.timestamp - session.startTime) / 60;
        uint cost = duration * pricePerMinute;

        require(balances[msg.sender] >= cost, "Not enough balance");

        balances[msg.sender] -= cost;

        (bool success, ) = payable(provider).call{value: cost}("");
        require(success, "Payment failed");

        session.active = false;

        emit SessionEnded(msg.sender, duration, cost);
    }
    /// @notice Withdraws remaining user balance
    function withdraw() public {
        uint amount = balances[msg.sender];
        require(amount > 0, "No balance");

        balances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");

        emit Withdrawn(msg.sender, amount);
    }
}
