const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = "./sequencer.proto"
const axios = require('axios')
const ethers = require('ethers')

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
}

let packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const seq = grpc.loadPackageDefinition(packageDefinition).sequencer;

const client = new seq.Sequencer(
    "localhost:50051",
    grpc.credentials.createInsecure()
);

async function startTest(){

    console.log("Starting test ... \n")

    let provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/MkqfsRsB8VOWDzaA_1xXPlJQlVc1njUr")
    
    let estimate = await provider.estimateGas({
        to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        data: "0x",
        value: ethers.utils.parseEther("0.1")
    })


    console.log("Stage 1 - Verifying Transactions in SM")
    let resp = await axios.post("http://localhost:3000/addbatch", {"txs": [{"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}, {"to":"0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d", "from":"0xE369a4954f41EC673d62Cf248df98BcC81a7967B", "amount":10, "nonce":0, "sign":"0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c"}]})
    console.log("\nNew state updated for L2 chain 🔥🔥🔥")
    console.log("Submitted Transaction :- ", resp.data)
    let tx = await provider.getTransactionReceipt(resp.data.txHash)
    console.log("Total Gas Used using our L2 Solution :- ", ethers.utils.formatEther(tx.gasUsed))
    console.log("Total Gas Used using normal L1 chain :- ", ethers.utils.formatEther(estimate.mul(ethers.BigNumber.from(10))))
    console.log("Performance Boost 🚀🚀🚀 :- ", ethers.utils.formatUnits((estimate.mul(ethers.BigNumber.from(10))).div(tx.gasUsed), "wei"))
    console.log("\n✅✅✅ Succesfully verified txs and state updated\n")
    
    console.log("\nStage 2 - Batching Txs and submitting to DA Layer(Celestia) ⏩⏩⏩")
    for(let i=0;i<10;i++){
        client.SubmitTransaction({
            to: "0x46b66C141d1f38f5C3f25A30DAE1CD5E7925bb6d",
            from: "0xE369a4954f41EC673d62Cf248df98BcC81a7967B",
            amount: "10",
            nonce: "0",
            sign: "0x3836e08607cf66ea5a2cb1ceb97ac46c192ead2ee86b4087ff252a578ec818301efbafaa8e72905b13a18c94dd4b433060f4155a08a582d8a0489a5c16f31ed51c",
            v: "123456789",
            r: "0",
            s: "0"
        }, (err, response) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`\nFrom server 🎯`, JSON.stringify(response));
            }
        });
    }
    console.log("\n✅✅✅ Succesfully batched and submitted Txs to DA Layer")
}

startTest()