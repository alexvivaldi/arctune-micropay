// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MicroTune is ReentrancyGuard, Ownable {
    uint256 public constant TOTAL_BPS = 10_000;
    // USDC on Arc uses 6 decimals. 0.05 USDC = 50_000 units.
    uint256 public constant DEFAULT_PRICE = 50_000;

    IERC20 public immutable usdc;
    uint256 public defaultPrice;

    struct Track {
        uint256 id;
        address artist;
        string title;
        string metadataURI;
        uint256 listenPrice;
        uint256 totalListens;
        uint256 totalRevenue;
        address[] beneficiaries;
        uint256[] shares;
    }

    uint256 public nextTrackId;
    mapping(uint256 => Track) public tracks;
    mapping(uint256 => mapping(address => uint256)) public earnedByBeneficiary;

    error ZeroAddress();
    error EmptyTitle();
    error NoBeneficiaries();
    error LengthMismatch();
    error InvalidShare();
    error InvalidSharesTotal();
    error UnknownTrack();
    error NotAuthorized();
    error ZeroPrice();
    error PaymentFailed();
    error SplitFailed();
    error DustTransferFailed();

    event TrackRegistered(
        uint256 indexed trackId,
        address indexed artist,
        string title,
        string metadataURI,
        uint256 listenPrice,
        address[] beneficiaries,
        uint256[] shares
    );

    event Listened(
        uint256 indexed trackId,
        address indexed listener,
        uint256 amount,
        uint256 totalListens
    );

    event PaymentSplit(
        uint256 indexed trackId,
        address indexed listener,
        address indexed beneficiary,
        uint256 amount
    );

    constructor(address _usdc, uint256 _initialPrice) Ownable(msg.sender) {
        if (_usdc == address(0)) revert ZeroAddress();
        usdc = IERC20(_usdc);
        defaultPrice = _initialPrice > 0 ? _initialPrice : DEFAULT_PRICE;
        nextTrackId = 1;
    }

    function registerTrack(
        string calldata title,
        string calldata metadataURI,
        uint256 listenPrice,
        address[] calldata beneficiaries,
        uint256[] calldata shares
    ) external returns (uint256 trackId) {
        if (bytes(title).length == 0) revert EmptyTitle();
        if (beneficiaries.length == 0) revert NoBeneficiaries();
        if (beneficiaries.length != shares.length) revert LengthMismatch();

        uint256 totalShares;
        for (uint256 i = 0; i < shares.length; i++) {
            if (shares[i] == 0) revert InvalidShare();
            if (beneficiaries[i] == address(0)) revert ZeroAddress();
            totalShares += shares[i];
        }
        if (totalShares != TOTAL_BPS) revert InvalidSharesTotal();

        if (listenPrice == 0) {
            listenPrice = defaultPrice;
        }

        trackId = nextTrackId++;
        Track storage t = tracks[trackId];
        t.id = trackId;
        t.artist = msg.sender;
        t.title = title;
        t.metadataURI = metadataURI;
        t.listenPrice = listenPrice;
        t.beneficiaries = beneficiaries;
        t.shares = shares;

        emit TrackRegistered(
            trackId,
            msg.sender,
            title,
            metadataURI,
            listenPrice,
            beneficiaries,
            shares
        );
    }

    function listen(uint256 trackId) external nonReentrant {
        Track storage t = tracks[trackId];
        if (t.id != trackId) revert UnknownTrack();
        if (t.listenPrice == 0) revert ZeroPrice();

        uint256 amount = t.listenPrice;

        if (!usdc.transferFrom(msg.sender, address(this), amount)) revert PaymentFailed();

        t.totalListens += 1;
        t.totalRevenue += amount;

        uint256 distributed;
        for (uint256 i = 0; i < t.beneficiaries.length; i++) {
            uint256 share = (amount * t.shares[i]) / TOTAL_BPS;
            if (share == 0) continue;
            distributed += share;
            earnedByBeneficiary[trackId][t.beneficiaries[i]] += share;
        }

        uint256 dust = amount - distributed;
        if (dust > 0) {
            earnedByBeneficiary[trackId][t.artist] += dust;
        }

        for (uint256 i = 0; i < t.beneficiaries.length; i++) {
            uint256 share = (amount * t.shares[i]) / TOTAL_BPS;
            if (share == 0) continue;
            if (!usdc.transfer(t.beneficiaries[i], share)) revert SplitFailed();
            emit PaymentSplit(trackId, msg.sender, t.beneficiaries[i], share);
        }

        if (dust > 0) {
            if (!usdc.transfer(t.artist, dust)) revert DustTransferFailed();
            emit PaymentSplit(trackId, msg.sender, t.artist, dust);
        }

        emit Listened(trackId, msg.sender, amount, t.totalListens);
    }

    function setTrackPrice(uint256 trackId, uint256 newPrice) external {
        Track storage t = tracks[trackId];
        if (t.id != trackId) revert UnknownTrack();
        if (msg.sender != t.artist && msg.sender != owner()) revert NotAuthorized();
        if (newPrice == 0) revert ZeroPrice();
        t.listenPrice = newPrice;
    }

    function setDefaultPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert ZeroPrice();
        defaultPrice = newPrice;
    }

    function getTrack(uint256 trackId) external view returns (Track memory) {
        if (tracks[trackId].id != trackId) revert UnknownTrack();
        return tracks[trackId];
    }

    function getTrackCount() external view returns (uint256) {
        return nextTrackId - 1;
    }

    function getEarned(uint256 trackId, address beneficiary) external view returns (uint256) {
        return earnedByBeneficiary[trackId][beneficiary];
    }

    function getExpectedSplits(uint256 trackId, uint256 amount) external view returns (address[] memory, uint256[] memory) {
        Track storage t = tracks[trackId];
        if (t.id != trackId) revert UnknownTrack();
        uint256[] memory out = new uint256[](t.shares.length);
        for (uint256 i = 0; i < t.shares.length; i++) {
            out[i] = (amount * t.shares[i]) / TOTAL_BPS;
        }
        return (t.beneficiaries, out);
    }
}
