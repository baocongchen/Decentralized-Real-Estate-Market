const HDWalletProvider = require("@truffle/hdwallet-provider")
const TruffleContract = require("truffle-contract")
const Web3 = require("web3")
const path = require("path")
const fs = require("fs")
require("dotenv").config()
const CONTRACT_SOL = "./build/contracts/SolnSquareVerifier.json"

const INFURA_KEY = process.env.INFURA_KEY
const MNEMONIC = fs.readFileSync(".secret").toString().trim()
const OWNER_ADDRESS = process.env.OWNER_ADDRESS
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const PROOFS = [
    "../zokrates/code/square/proof.json",
    "../zokrates/code/square/proof1.json",
    "../zokrates/code/square/proof2.json",
    "../zokrates/code/square/proof3.json",
    "../zokrates/code/square/proof4.json",
    "../zokrates/code/square/proof5.json",
    "../zokrates/code/square/proof7.json",
    "../zokrates/code/square/proof8.json",
    "../zokrates/code/square/proof9.json",
]

if (!MNEMONIC || !INFURA_KEY) {
    console.error("############ Please set a mnemonic and infura key! ############")
}

function getProvider() {
    return new HDWalletProvider(MNEMONIC, `https://rinkeby.infura.io/v3/${INFURA_KEY}`)
}
function getContract() {
    const contract = JSON.parse(fs.readFileSync(path.join(__dirname, CONTRACT_SOL), "utf-8"))
    return TruffleContract(contract)
}
function loadProofs() {
    return PROOFS.map((p) => JSON.parse(fs.readFileSync(path.join(__dirname, p), "utf-8")))
}

async function initialize(CONTRACT_ADDRESS) {
    let proofs = loadProofs()
    let provider = getProvider()
    let contractSol = getContract()
    contractSol.setProvider(provider)
    let contract = await contractSol.deployed()
    return main(contract, proofs, CONTRACT_ADDRESS)
}

async function main(contract, proofs, CONTRACT_ADDRESS) {
    for (let i = 0; i < proofs.length; i++) {
        const proof = proofs[i]
        let currentTokenSupply = await contract.totalSupply()
        let newTokenId = parseInt(currentTokenSupply.toNumber()) + 1
        try {
            await contract.addSolution(
                i + 1,
                CONTRACT_ADDRESS,
                proof.proof.a,
                proof.proof.b,
                proof.proof.c,
                proof.inputs,
                {
                    from: OWNER_ADDRESS,
                }
            )
            console.log("Solution added")
        } catch (e) {
            console.log(`Failed to add the solution\n${e.message}`)
            continue
        }
        try {
            currentTokenSupply = await contract.totalSupply()
        } catch (e) {
            console.log(
                `Failed to get total token supply\n${e.message}\nSetting currentTokenSupply to 0.`
            )
        }
        try {
            await contract.mint(OWNER_ADDRESS, newTokenId, { from: OWNER_ADDRESS })
        } catch (e) {
            console.log(`Failed to mint the token\n${e.message}`)
        }
        console.log(`Token with Id = ${newTokenId} has been minted successfully`)
    }
}
initialize(CONTRACT_ADDRESS).then(() => console.log("FINISH"))
