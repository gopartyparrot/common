import { Provider as AnchorProvider } from "@project-serum/anchor";
import {
  Broadcaster,
  DEFAULT_PROVIDER_OPTIONS,
  MultipleConnectionBroadcaster,
  SignerWallet,
  SolanaProvider,
  Wallet,
} from "@saberhq/solana-contrib";
import { ConfirmOptions, Connection, Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";

const isNode = typeof process === "object";

// TODO add multiple wallets support
export class MultipleWalletProvider extends SolanaProvider {
  constructor(
    override readonly connection: Connection,
    readonly broadcaster: Broadcaster,
    override readonly wallet: Wallet,
    override readonly opts: ConfirmOptions
  ) {
    super(connection, broadcaster, wallet, opts);
  }

  private static loadSigner(path: string): Keypair {
    return Keypair.fromSecretKey(
      Buffer.from(JSON.parse(readFileSync(path, { encoding: "utf-8" })))
    );
  }

  static init({ connection, broadcastConnections = [connection], wallet }) {
    return new MultipleWalletProvider(
      connection,
      new MultipleConnectionBroadcaster(broadcastConnections),
      wallet,
      DEFAULT_PROVIDER_OPTIONS
    );
  }

  static env() {
    if (!isNode) {
      throw new Error(`Provider env is not available on browser.`);
    }
    const process = require("process");
    const url = process.env.ANCHOR_PROVIDER_URL;
    if (url === undefined) {
      throw new Error("ANCHOR_PROVIDER_URL is not defined");
    }
    const connection = new Connection(url, "finalized");

    if (process.env.ANCHOR_WALLET === undefined) {
      throw new Error("ANCHOR_WALLET is not defined");
    }
    const signer = this.loadSigner(process.env.ANCHOR_WALLET);
    const wallet = new SignerWallet(signer);

    return MultipleWalletProvider.init({
      connection,
      wallet,
    }) as MultipleWalletProvider;
  }

  get anchorProvider(): AnchorProvider {
    return new AnchorProvider(this.connection, this.wallet, {
      ...AnchorProvider.defaultOptions(),
      commitment: "finalized",
    });
  }
}
