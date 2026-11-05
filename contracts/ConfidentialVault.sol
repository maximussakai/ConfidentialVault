// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ConfidentialVault
/// @notice Stores client-side ciphertext; all onchain data and reads are public.
/// @dev Deletion removes current storage, not historical chain data. No keys or
/// plaintext should be submitted. Fee amounts use USDC's six-decimal units.
contract ConfidentialVault is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_FEE = 1_000_000;
    uint256 public constant MAX_CIPHERTEXT = 4096;

    IERC20 public immutable usdc;
    uint256 public fee;
    address public treasury;

    struct Entry {
        bytes ciphertext;
        uint64 createdAt;
        uint64 updatedAt;
        uint8 scheme;
    }

    /// @notice Next entry id per address; deletion never decrements this counter.
    mapping(address => uint256) public entryCount;
    mapping(address => mapping(uint256 => Entry)) private entries;

    error ZeroAddress();
    error FeeExceedsCap(uint256 requestedFee);
    error FeeAboveMax(uint256 currentFee, uint256 maxFee);
    error InvalidCiphertextLength(uint256 length);
    error EntryNotFound(address entryOwner, uint256 id);
    error OwnershipRenunciationDisabled();

    event EntryCreated(address indexed owner, uint256 indexed id, uint8 scheme, uint256 feePaid);
    event EntryUpdated(address indexed owner, uint256 indexed id, uint8 scheme);
    event EntryDeleted(address indexed owner, uint256 indexed id);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(address usdc_, address initialOwner, address treasury_, uint256 initialFee)
        Ownable(initialOwner)
    {
        // Ownable also rejects a zero initialOwner with OwnableInvalidOwner.
        if (usdc_ == address(0) || initialOwner == address(0) || treasury_ == address(0)) {
            revert ZeroAddress();
        }
        if (initialFee > MAX_FEE) revert FeeExceedsCap(initialFee);
        usdc = IERC20(usdc_);
        treasury = treasury_;
        fee = initialFee;
    }

    /// @notice Creates an entry for the caller and pays the current fee directly to treasury.
    /// @param maxFee Maximum acceptable fee, protecting against intervening fee changes.
    function createEntry(bytes calldata ciphertext, uint8 scheme, uint256 maxFee)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 id)
    {
        _validateCiphertext(ciphertext.length);
        uint256 currentFee = fee;
        if (currentFee > maxFee) revert FeeAboveMax(currentFee, maxFee);

        id = entryCount[msg.sender];
        entryCount[msg.sender] = id + 1;
        uint64 timestamp = uint64(block.timestamp);
        entries[msg.sender][id] = Entry({
            ciphertext: ciphertext,
            createdAt: timestamp,
            updatedAt: timestamp,
            scheme: scheme
        });
        emit EntryCreated(msg.sender, id, scheme, currentFee);

        if (currentFee > 0) {
            usdc.safeTransferFrom(msg.sender, treasury, currentFee);
        }
    }

    /// @notice Replaces the caller's existing entry without charging a fee.
    function updateEntry(uint256 id, bytes calldata ciphertext, uint8 scheme) external whenNotPaused {
        Entry storage entry = entries[msg.sender][id];
        if (entry.ciphertext.length == 0) revert EntryNotFound(msg.sender, id);
        _validateCiphertext(ciphertext.length);
        entry.ciphertext = ciphertext;
        entry.scheme = scheme;
        entry.updatedAt = uint64(block.timestamp);
        emit EntryUpdated(msg.sender, id, scheme);
    }

    /// @notice Deletes the caller's entry even while paused. No fee or refund.
    function deleteEntry(uint256 id) external {
        if (entries[msg.sender][id].ciphertext.length == 0) revert EntryNotFound(msg.sender, id);
        delete entries[msg.sender][id];
        emit EntryDeleted(msg.sender, id);
    }

    /// @notice Reads any address's ciphertext; this is not a confidential read channel.
    /// @dev Reverts for entries that were never created or have been deleted.
    function getEntry(address entryOwner, uint256 id) external view returns (Entry memory) {
        Entry storage entry = entries[entryOwner][id];
        if (entry.ciphertext.length == 0) revert EntryNotFound(entryOwner, id);
        return entry;
    }

    function setFee(uint256 newFee) external onlyOwner {
        if (newFee > MAX_FEE) revert FeeExceedsCap(newFee);
        uint256 oldFee = fee;
        fee = newFee;
        emit FeeUpdated(oldFee, newFee);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /// @notice Ownership may only change via the inherited two-step transfer.
    function renounceOwnership() public pure override {
        revert OwnershipRenunciationDisabled();
    }

    function _validateCiphertext(uint256 length) private pure {
        if (length == 0 || length > MAX_CIPHERTEXT) revert InvalidCiphertextLength(length);
    }
}
