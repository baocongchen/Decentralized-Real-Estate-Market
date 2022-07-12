const Verifier = artifacts.require("Verifier")

contract("Verifier", (accounts) => {
    const account_one = accounts[0]
    const Proof = require("./proof")

    describe("test square verifier - zokrates", function () {
        beforeEach(async function () {
            this.contract = await Verifier.new({ from: account_one, gas: 6000000 })
        })

        // Test verification with correct proof
        // - use the contents from proof.json generated from zokrates steps
        it("Test verification with correct proof", async function () {
            const { inputs: inputs } = Proof

            const isCorrect = await this.contract.verifyTx.call(Proof.proof, inputs, {
                from: account_one,
            })

            assert.equal(isCorrect, true, "Invalid proof result")
        })

        // Test verification with incorrect proof
        it("Test verification with incorrect proof", async function () {
            const inputs = [
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
            ]

            const isCorrect = await this.contract.verifyTx.call(Proof.proof, inputs, {
                from: account_one,
            })

            assert.equal(isCorrect, false, "Invalid proof result")
        })
    })
})
