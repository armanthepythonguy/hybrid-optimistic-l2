import ethers from "ethers"
import fs from "fs"

export async function generateWallet() {
    let wallet = await new ethers.Wallet.createRandom()
    let data = fs.readFileSync('wallets.json')
    const jsonData = JSON.parse(data)
    jsonData[wallet.address] = wallet.privateKey
    fs.writeFileSync('wallets.json', JSON.stringify(jsonData));
    return [wallet.address, wallet.privateKey]
}
