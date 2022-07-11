// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;
import "./verifier.sol";
import "./ERC721Mintable.sol";

contract SquareVerifier is Verifier {}

contract SolnSquareVerifier is CustomERC721Token {
    struct solutions {
        uint256 index;
        address addressSol;
        uint256 solutionProvided;
    }

    solutions[] solutionsArray;

    SquareVerifier public squareVerifier;

    // mapping that stores unique solutions submitted
    mapping(bytes32 => solutions) uniqueSolutions;

    // event to emit when a solution is added
    event solutionAdded(address from, uint256 index1);

    constructor(address verifier) public {
        squareVerifier = SquareVerifier(verifier);
    }

    function addSolution(
        uint256 _index,
        address _address,
        uint256[2] memory A,
        uint256[2][2] memory B,
        uint256[2] memory C,
        uint256[2] memory INPUT
    ) public {
        solutions memory Solution = solutions({
            index: _index,
            addressSol: _address,
            solutionProvided: 1
        });
        bytes32 uniqueKey = keccak256(abi.encodePacked(A, B, C, INPUT));
        uniqueSolutions[uniqueKey] = Solution;
        solutionsArray.push(Solution);
        emit solutionAdded(address1, index1);
    }

    function getSolutionsCount() external view returns (uint256) {
        return solutionsArray.length;
    }

    // function to mint new NFT when solution has been verified
    function mint(
        uint256[2] memory A,
        uint256[2][2] memory B,
        uint256[2] memory C,
        uint256[2] memory INPUT,
        uint256 ID
    ) public returns (bool) {
        bytes32 uniqueKeyCheck = keccak256(abi.encodePacked(A, B, C, INPUT));
        if (uniqueSolutions[uniqueKeyCheck].solutionProvided == 1) {
            revert("Solution not unique! Must provide a new solution");
        }
        if (!squareVerifier.verifyTx(A, B, C, INPUT)) {
            revert("Solution wrong! Must provide a correct solution");
        }
        addSolution(ID, msg.sender, A, B, C, INPUT);
        bool success = mint(msg.sender, ID);
        return success;
    }
}
