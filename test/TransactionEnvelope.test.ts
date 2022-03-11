import { BN, web3 } from "@project-serum/anchor";
import {
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@project-serum/associated-token";
import { TokenInstructions } from "@project-serum/token";
import { Keypair, SystemInstruction, SystemProgram } from "@solana/web3.js";
import { RetriableTransactionEnvelope } from "../src";
import { provider } from "./utils/env";

describe("TransactionEnvelope", () => {
  const dest = Keypair.generate();
  it("should be wait for a tx confirmed", async () => {
    const instructions: web3.TransactionInstruction[] = [];
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: dest.publicKey,
        lamports: 1e7,
      })
    );

    const txEnvolope = new RetriableTransactionEnvelope(provider, instructions);

    const res = await txEnvolope.confirm();
    expect(res.signature).toBeDefined;
  });
});
