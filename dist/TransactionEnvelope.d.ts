import { BroadcastOptions as SaberBroadcastOptions, TransactionEnvelope as SaberTransactionEnvelope, TransactionReceipt } from "@saberhq/solana-contrib";
import { Finality } from "@solana/web3.js";
export interface BroadcastOptions extends SaberBroadcastOptions {
    resend?: number;
    commitment?: Finality;
}
export declare class RetriableTransactionEnvelope extends SaberTransactionEnvelope {
    static from(envelope: SaberTransactionEnvelope): RetriableTransactionEnvelope;
    partition(): RetriableTransactionEnvelope[];
    confirmAll(opts?: BroadcastOptions): Promise<TransactionReceipt[]>;
    confirm(opts?: BroadcastOptions): Promise<TransactionReceipt>;
}
