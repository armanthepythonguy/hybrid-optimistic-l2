use std::io::{Read, Write};
use flate2::write::ZlibEncoder;
use flate2::bufread::ZlibDecoder;
use flate2::Compression;
use serde::{Deserialize, Serialize};
use batcher::batcher_server::{Batcher, BatcherServer};
use batcher::{CreateBatchRequest, CreateBatchResponse, TxRequest};
use tonic::{Request, Response, Status, transport::Server};
use bincode::{serialize, deserialize};


#[derive(Serialize, Deserialize, Debug)]
pub struct Tx{
    from : String,
    to: String,
    amount: String,
    nonce : String,
    sign : String,
    v : String,
    r : String,
    s :  String
}

fn tx_to_u8(txs: &Vec<Tx>) -> Vec<u8>{
    serialize(txs).unwrap()
}

fn u8_to_tx(txs: &Vec<u8>) -> Vec<Tx>{
    deserialize(txs).unwrap()
}
fn tx_refactor(req: Vec<TxRequest>) -> Vec<Tx>{
    let mut refactor = Vec::new();
    for item in req.iter(){
        refactor.push(Tx{
            from: item.from.clone(),
            to: item.to.clone(),
            amount: item.amount.clone(),
            nonce: item.nonce.clone(),
            sign: item.sign.clone(),
            v: item.v.clone(),
            r: item.r.clone(),
            s: item.s.clone()
        });
    }
    refactor
}

fn tx_request_refactor(req: Vec<Tx>) -> Vec<TxRequest>{
    let mut refactor = Vec::new();
    for item in req.iter(){
        refactor.push(TxRequest{
            from: item.from.clone(),
            to: item.to.clone(),
            amount: item.amount.clone(),
            nonce: item.nonce.clone(),
            sign: item.sign.clone(),
            v: item.v.clone(),
            r: item.r.clone(),
            s: item.s.clone()
        });
    }
    refactor
}

pub mod batcher{
    tonic::include_proto!("batcher");
}

#[derive(Debug, Default)]
pub struct BatcherService{}

#[tonic::async_trait]
impl Batcher for BatcherService{
    async fn create_batch(
        &self,
        request: Request<CreateBatchRequest>
    ) -> Result<Response<CreateBatchResponse>, Status>{
        let req = request.into_inner();
        let txs = tx_refactor(req.txs.clone());
        let mut compressor = ZlibEncoder::new(Vec::new(), Compression::default());
        compressor.write_all(&tx_to_u8(&txs)).unwrap();
        println!("Request = {:?}", req);
        let reply = CreateBatchResponse{
            batched_tx : compressor.finish().unwrap()
        };
        Ok(Response::new(reply))
    }

    async fn decode_batch(
        &self,
        request: Request<CreateBatchResponse>
    ) -> Result<Response<CreateBatchRequest>, Status> {
        let req = request.into_inner();
        let mut decoder = ZlibDecoder::new(&req.batched_tx[..]);
        let mut decoded = Vec::new();
        decoder.read_to_end(&mut decoded)?;
        let reply = CreateBatchRequest{
            txs: tx_request_refactor(u8_to_tx(&decoded))
        };
        Ok(Response::new(reply))
    }
}


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>>{
    let addr = "0.0.0.0:50052".parse()?;
    let batcher_service = BatcherService::default();

    Server::builder()
        .add_service(BatcherServer::new(batcher_service))
        .serve(addr)
        .await?;

    Ok(())
}