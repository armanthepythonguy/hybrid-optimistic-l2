use batcher::batcher_client::BatcherClient;
use batcher::{CreateBatchRequest,TxRequest,CreateBatchResponse};

pub mod batcher{
    tonic::include_proto!("batcher");
}


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>>{
    let mut client = BatcherClient::connect("http://[::1]:50051").await?;
    let mut txs : Vec<TxRequest> = Vec::new();
    txs.push(TxRequest{
        from: String::from("Hello world"),
        to: String::from("Hello world"),
        amount: String::from("Hello world"),
        nonce: String::from("Hello world"),
        sign: String::from("Hello world"),
        v: String::from("Hello world"),
        r: String::from("Hello world"),
        s:String::from("Hello world")
    });
    let request = tonic::Request::new(
        CreateBatchRequest{
            txs: txs
        }
    );
    let response = client.create_batch(request).await?;
    println!("Response={:?}", response);
    let request2 = tonic::Request::new(
        CreateBatchResponse{
            batched_tx: response.into_inner().batched_tx
        }
    );
    let response2 = client.decode_batch(request2).await?;
    println!("Response={:?}", response2);
    Ok(())
}