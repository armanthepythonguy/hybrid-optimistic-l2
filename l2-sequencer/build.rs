fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("proto/sequencer.proto")?;
    tonic_build::compile_protos("proto/batcher.proto")?;
    Ok(())
}