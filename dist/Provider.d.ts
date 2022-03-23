import { Provider as AnchorProvider } from "@project-serum/anchor";
import { Broadcaster, SolanaProvider, Wallet } from "@saberhq/solana-contrib";
import { ConfirmOptions, Connection } from "@solana/web3.js";
export declare class MultipleWalletProvider extends SolanaProvider {
    readonly connection: Connection;
    readonly broadcaster: Broadcaster;
    readonly wallet: Wallet;
    readonly opts: ConfirmOptions;
    constructor(connection: Connection, broadcaster: Broadcaster, wallet: Wallet, opts: ConfirmOptions);
    private static loadSigner;
    static init({ connection, broadcastConnections, wallet }: {
        connection: any;
        broadcastConnections?: any[] | undefined;
        wallet: any;
    }): MultipleWalletProvider;
    static env(): MultipleWalletProvider;
    get anchorProvider(): AnchorProvider;
}
