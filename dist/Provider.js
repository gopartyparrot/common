"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultipleWalletProvider = void 0;
const anchor_1 = require("@project-serum/anchor");
const solana_contrib_1 = require("@saberhq/solana-contrib");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = require("fs");
const isNode = typeof process === "object";
// TODO add multiple wallets support
class MultipleWalletProvider extends solana_contrib_1.SolanaProvider {
    connection;
    broadcaster;
    wallet;
    opts;
    constructor(connection, broadcaster, wallet, opts) {
        super(connection, broadcaster, wallet, opts);
        this.connection = connection;
        this.broadcaster = broadcaster;
        this.wallet = wallet;
        this.opts = opts;
    }
    static loadSigner(path) {
        return web3_js_1.Keypair.fromSecretKey(Buffer.from(JSON.parse((0, fs_1.readFileSync)(path, { encoding: "utf-8" }))));
    }
    static init({ connection, broadcastConnections = [connection], wallet }) {
        return new MultipleWalletProvider(connection, new solana_contrib_1.MultipleConnectionBroadcaster(broadcastConnections), wallet, solana_contrib_1.DEFAULT_PROVIDER_OPTIONS);
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
        const connection = new web3_js_1.Connection(url, "finalized");
        if (process.env.ANCHOR_WALLET === undefined) {
            throw new Error("ANCHOR_WALLET is not defined");
        }
        const signer = this.loadSigner(process.env.ANCHOR_WALLET);
        const wallet = new solana_contrib_1.SignerWallet(signer);
        return MultipleWalletProvider.init({
            connection,
            wallet,
        });
    }
    get anchorProvider() {
        return new anchor_1.Provider(this.connection, this.wallet, {
            ...anchor_1.Provider.defaultOptions(),
            commitment: "finalized",
        });
    }
}
exports.MultipleWalletProvider = MultipleWalletProvider;
