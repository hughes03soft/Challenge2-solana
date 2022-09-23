// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
     16, 240, 245, 106, 223, 250, 197, 104, 193, 2, 98, 179, 3,
     5, 81, 45, 67, 96, 221, 132, 18, 136, 90, 191, 229, 74, 80,
     27, 90, 206, 80, 18, 58, 124, 138, 159, 33, 111, 3, 219, 209,
     250, 43, 17, 81, 115, 17, 197, 40, 247, 126, 78, 4, 23, 218,
     246, 110, 113, 135, 226, 211, 100, 118, 18,
    ]            
);


const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    let walletBalance = await connection.getBalance(
        new PublicKey(from.publicKey));

    console.log(`From Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: walletBalance / 2
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    walletBalance = await connection.getBalance(
        new PublicKey(from.publicKey));

    console.log(`From Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
}

transferSol();