import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  SingleConnectionBroadcaster,
  SolanaProvider,
} from "@saberhq/solana-contrib";
import { Connection, Keypair } from "@solana/web3.js";
import secretKey from "./id.json";

const connection = new Connection("https://api.testnet.solana.com");

const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey as number[]));
const wallet = new NodeWallet(payer);
export const provider = new SolanaProvider(
  connection,
  new SingleConnectionBroadcaster(connection),
  wallet,
  {
    commitment: "confirmed",
  }
);
