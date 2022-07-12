const Proof = require("./proof.json")
const SolnSquareVerifier = artifacts.require("SolnSquareVerifier")
const Verifier = artifacts.require("SquareVerifier")

contract("Test functions in TestSolnSquareVerifier", (accounts) => {
    const account_one = accounts[0]
    const account_two = accounts[1]

    describe("Test Verifier", function () {
        beforeEach(async function () {
            const verifierContract = await Verifier.new({ from: account_one })
            this.contract = await SolnSquareVerifier.new(verifierContract.address, {
                from: account_one,
            })
        })

        it("add new solutions", async function () {
            const to = account_two
            const tokenId = 999
            const proofs = Object.values(Proof.proof)
            const inputs = Proof.inputs
            const tx = await this.contract.addSolution(to, tokenId, ...proofs, inputs, {
                from: account_one,
            })
            const solutionAddedEvent = tx.logs[0].event
            assert.equal(
                solutionAddedEvent,
                "SolutionAdded",
                "SolutionAdded event has not been emitted"
            )
        })

        it("mint tokens", async function () {
            const tx = await this.contract.mintToken(account_two, 1, { from: account_one })
            const tokenMintedEvent = tx.logs[0].event
            assert.equal(
                tokenMintedEvent,
                "Transfer",
                "Minting Failed! Transfer event has not been emitted"
            )
        })
    })
})
