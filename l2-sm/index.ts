import express, { Express, Request, Response } from "express";
import { SMT} from "@cedoor/smt"
import { ChildNodes } from "@cedoor/smt/dist/types/smt"
import { sha256 } from "js-sha256"
import { ethers } from "ethers";
const abi = require("./abi.json")

const app: Express = express();
app.use(express.json());
const port = 3000;
let accCounter = 1;
let addressToDecMapping :any = {"0xE369a4954f41EC673d62Cf248df98BcC81a7967B":"0"}
const hash = (childNodes: ChildNodes) => sha256(childNodes.join(""))
const tree = new SMT(hash)
tree.add("0", "1000")

app.post("/addbatch", async (req: Request, res:Response) => {
    const body = req.body["txs"]
    for(let i=0; i<body.length; i++){
        await addTx(body[i], res)
    }
    let provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/MkqfsRsB8VOWDzaA_1xXPlJQlVc1njUr")
    let wallet = new ethers.Wallet("pvt key", provider)
    let contract = new ethers.Contract("0x9008F54C49723d5cfeBBDC7224858eCA6955e61e", abi, wallet)
    const Txresp = await contract.updateState(`0x${tree.root.toString(16)}`)
    await Txresp.wait()
    res.send({"txHash": Txresp.hash, "gasUsed": Txresp.gasUsed})
});

app.post("/getbalance", async(req:Request, res:Response) => {
    const result = tree.get(addressToDecMapping[req.body["address"]].toString(16));
    res.send({balance : parseInt(result.toString(), 16)})
})

app.get("/getroot", async(req:Request, res:Response) => {
    res.send({root : tree.root})
})

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

async function addTx(body:any, res:Response){
    console.log(body)
    const tx = {to:body["to"], from:body["from"], amount:body["amount"], nonce:body["nonce"]};
    const computedAddress = ethers.utils.verifyMessage(JSON.stringify(tx), body["sign"]);
    if(computedAddress!=body["from"]){
        res.send(false)
    }
    let sender = tree.get(addressToDecMapping[body["from"]].toString(16))
    if(sender===undefined){
        res.send(false)
    }
    if(parseInt(sender.toString(), 16) < body["amount"]){
        res.send(false)
    }
    if(!(body["to"] in addressToDecMapping)){
        addressToDecMapping[body["to"]] = accCounter;
        tree.add(accCounter.toString(16), "0")
        accCounter+=1
    }
    let receiver = tree.get(addressToDecMapping[body["to"]].toString(16))
    tree.update(addressToDecMapping[body["to"]].toString(16), (parseInt(receiver.toString(), 16)+parseInt(body["amount"])).toString(16))
    tree.update(addressToDecMapping[body["from"]].toString(16), (parseInt(sender.toString(), 16)-parseInt(body["amount"])).toString(16))
}
