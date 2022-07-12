const ERC721MintableComplete = artifacts.require("CustomERC721Token")

contract("TestERC721Mintable", (accounts) => {
    const account_one = accounts[0]
    const account_two = accounts[1]

    describe("Test contract ownership and mint functions", function () {
        beforeEach(async function () {
            this.contract = await ERC721MintableComplete.new({ from: account_one })
        })

        it("Non-contract owner must not be able to mint tokens", async function () {
            let error
            try {
                await this.contract.mint.call(account_two, 999, { from: account_two })
            } catch (e) {
                error = e
            }
            assert.notEqual(
                typeof error,
                "undefined",
                "non-contract owner must not be able to mint tokens!"
            )
        })

        it("return contract owner", async function () {
            const result = await this.contract.owner.call({
                from: account_two,
            })
            assert.equal(result, account_one, `contract owner has to be ${account_one}!`)
        })
    })

    describe("Test other functions in CustomERC721Token", function () {
        beforeEach(async function () {
            this.contract = await ERC721MintableComplete.new({ from: account_one })

            await this.contract.mint(account_one, 1, {
                from: account_one,
            })
            await this.contract.mint(account_one, 2, {
                from: account_one,
            })
            await this.contract.mint(account_two, 3, {
                from: account_one,
            })
            await this.contract.mint(account_two, 4, {
                from: account_one,
            })
            await this.contract.mint(account_two, 5, {
                from: account_one,
            })
        })

        it("return correct total amount of minted tokens", async function () {
            const result = await this.contract.totalSupply.call()
            assert.equal(result, 5, "total number of minted tokens is incorrect!")
        })

        it("get token balance of a given address", async function () {
            const result = await this.contract.balanceOf.call(account_two, {
                from: account_two,
            })
            assert.equal(result, 3, `Wrong token balance of account ${account_two}!`)
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it("return token uri", async function () {
            const result = await this.contract.tokenURI.call(3, { from: account_two })
            assert.equal(
                result,
                "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/3",
                "Wrong Token URI!"
            )
        })

        it("transfer token to another account", async function () {
            await this.contract.transferFrom(account_two, account_one, 3, {
                from: account_two,
            })
            const account = await this.contract.ownerOf.call(3, { from: account_one })

            assert.equal(account, account_one, "Wrong Token Owner!")
            const balance = await this.contract.balanceOf.call(account_two, {
                from: account_two,
            })
            assert.equal(
                balance,
                2,
                `Wrong token balance of account ${account_two} after transfer of ownership!`
            )
        })

        it("account must be able to tranfer token after receiving approval from owner", async function () {
            await this.contract.approve(account_two, 1, {
                from: account_one,
            })
            await this.contract.transferFrom(account_one, account_two, 1, {
                from: account_two,
            })
            const approvedAccount = await this.contract.getApproved(1)
            const account = await this.contract.ownerOf.call(1, { from: account_one })

            assert.equal(
                approvedAccount,
                account_two,
                `Account ${account_two} didn't have approval`
            )
            assert.equal(account, account_two, "Wrong Token Owner!")
        })
    })
})
