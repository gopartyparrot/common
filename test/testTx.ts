import { web3 } from "@project-serum/anchor";
import { SystemProgram } from "@solana/web3.js";
import { MultipleWalletProvider, RetriableTransactionEnvelope } from "../src";

(async () => {
  const provider = MultipleWalletProvider.env();
  const dest = new web3.PublicKey(
    "4Jfinpcv8KKAB9sTavsxQhxmsUAu7DktNi58VnCz414g"
  );

  const instructions: web3.TransactionInstruction[] = [];
  instructions.push(
    SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: dest,
      lamports: 1e7,
    })
  );

  const txEnvolope = new RetriableTransactionEnvelope(provider, instructions);

  const receipts = await txEnvolope.confirmAll({
    resend: 3,
    commitment: "finalized",
  });

  console.log(receipts.map((r) => r.signature));
})();
