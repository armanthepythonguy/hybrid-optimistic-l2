use sequencer::sequencer_server::{Sequencer, SequencerServer};
use sequencer::{TxReceipt, TxRequest};
use tonic::{Request, Response, Status, transport::Server};
use batcher::{CreateBatchRequest, CreateBatchResponse};
use batcher::batcher_client::BatcherClient;
use std::collections::HashMap;
use std::{process::{Command, Stdio}, str::Bytes};

pub mod batcher{
    tonic::include_proto!("batcher");
}

pub mod sequencer{
    tonic::include_proto!("sequencer");
}

#[derive(Debug, Default)]
pub struct SequencerService{}

static mut MEMPOOL : Vec<batcher::TxRequest> = Vec::new();

pub fn should_submit() ->  bool{
    (unsafe { MEMPOOL.len() } >= 10)
}

pub async fn submit_batch() -> Result<CreateBatchResponse, Box<dyn std::error::Error>>{
    let mut client = BatcherClient::connect("grpc://localhost:50052").await?;
    let request = tonic::Request::new(
        CreateBatchRequest{
            txs: unsafe { MEMPOOL.clone() }
        }
    );
    let response = client.create_batch(request).await?;
    Ok(response.into_inner())
}

impl From<sequencer::TxRequest> for batcher::TxRequest {
    fn from(item: sequencer::TxRequest) -> Self {
        batcher::TxRequest { from: item.from, to: item.to, amount: item.amount, nonce: item.nonce, sign: item.sign, v: item.v, r: item.r, s: item.s }
    }
}

#[tonic::async_trait]
impl Sequencer for SequencerService{

    async fn submit_transaction(
        &self,
        request: Request<TxRequest>
    ) -> Result<Response<TxReceipt>, Status>{
        let tx = request.into_inner();
        unsafe {
            MEMPOOL.push(tx.into());
        }
        if should_submit(){
            println!("Submitting new batch");
            let batched_tx = submit_batch().await;
            match batched_tx {
                Ok(txs) => {
                    println!("Batched bytes :- {:?}", txs.batched_tx);
                    upload_celestia(txs.batched_tx);
                    unsafe { MEMPOOL.clear() };
                },
                Err(er) => println!("{:?}", er)
            }

        }else{
            println!("Recieved a tx");
            println!("Waiting for more txs");
        }
        let reply = TxReceipt{
            txhash: String::from("0x"),
            gas_used: String::from("0")
        };
        Ok(Response::new(reply))
    }

}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>>{
    let addr = "0.0.0.0:50051".parse()?;
    let sequencer_service = SequencerService::default();

    Server::builder()
        .add_service(SequencerServer::new(sequencer_service))
        .serve(addr)
        .await?;

    Ok(())
}

pub fn upload_celestia(data: Vec<u8>){
    let output = Command::new("celestia")
        .arg("blob")
        .arg("submit")
        .arg("0x42690c204d39600fddd3")
        .arg(format!("'{}'", clean_data(data)))
        .arg("--token")
        .arg("auth-token")
        .stdout(Stdio::piped())
        .output()
        .unwrap();

    // extract the raw bytes that we captured and interpret them as a string
    let stdout = String::from_utf8(output.stdout).unwrap();

    println!("Celestia upload proof :- {}", stdout);
    // println!("{}", clean_data(data));
}

pub fn clean_data(data: Vec<u8>) -> String{
    let string_representation: String = data.iter()
        .map(|num| num.to_string())
        .collect::<Vec<String>>()
        .join(",");
    string_representation
}