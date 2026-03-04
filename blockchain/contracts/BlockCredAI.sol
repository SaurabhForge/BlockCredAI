// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract BlockCredAI is ERC721, AccessControl {
  bytes32 public constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");

  struct JobRecord {
    uint256 jobId;
    address employer;
    address employee;
    string jobDetails;
    uint256 startDate;
    uint256 endDate;
    string ipfsHash;
    uint256 tokenId;
  }

  uint256 private _jobCounter;
  uint256 private _tokenCounter;

  mapping(address => uint256[]) private _employeeJobs;
  mapping(uint256 => JobRecord) private _jobs;

  event JobSubmitted(uint256 indexed jobId, address indexed employer, address indexed employee);
  event JobVerified(uint256 indexed jobId, uint256 tokenId);

  constructor() ERC721("BlockCredAI Employment Badge", "BCAIB") {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  modifier onlyEmployer() {
    require(hasRole(EMPLOYER_ROLE, msg.sender), "Not employer");
    _;
  }

  function grantEmployerRole(address employer) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(EMPLOYER_ROLE, employer);
  }

  function submitVerification(
    address employee,
    string calldata jobDetails,
    uint256 startDate,
    uint256 endDate,
    string calldata ipfsHash
  ) external onlyEmployer returns (uint256) {
    require(employee != address(0), "Invalid employee");
    require(startDate < endDate, "Invalid dates");

    _jobCounter++;
    uint256 jobId = _jobCounter;
    _tokenCounter++;
    uint256 tokenId = _tokenCounter;

    _safeMint(employee, tokenId);

    JobRecord memory jr = JobRecord({
      jobId: jobId,
      employer: msg.sender,
      employee: employee,
      jobDetails: jobDetails,
      startDate: startDate,
      endDate: endDate,
      ipfsHash: ipfsHash,
      tokenId: tokenId
    });

    _jobs[jobId] = jr;
    _employeeJobs[employee].push(jobId);

    emit JobSubmitted(jobId, msg.sender, employee);
    emit JobVerified(jobId, tokenId);

    return jobId;
  }

  function verifyEmployment(address employee, uint256 jobId)
    external
    view
    returns (
      bool exists,
      address employer,
      string memory jobDetails,
      uint256 startDate,
      uint256 endDate,
      string memory ipfsHash,
      uint256 tokenId
    )
  {
    JobRecord memory jr = _jobs[jobId];
    if (jr.employee != employee) {
      return (false, address(0), "", 0, 0, "", 0);
    }
    return (true, jr.employer, jr.jobDetails, jr.startDate, jr.endDate, jr.ipfsHash, jr.tokenId);
  }

  function getEmployeeHistory(address employee)
    external
    view
    returns (JobRecord[] memory)
  {
    uint256[] memory ids = _employeeJobs[employee];
    JobRecord[] memory records = new JobRecord[](ids.length);
    for (uint256 i = 0; i < ids.length; i++) {
      records[i] = _jobs[ids[i]];
    }
    return records;
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }
}
