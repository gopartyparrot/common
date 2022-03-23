import {
  BroadcastOptions as SaberBroadcastOptions,
  TransactionEnvelope as SaberTransactionEnvelope,
  TransactionReceipt,
} from "@saberhq/solana-contrib";
import { Finality } from "@solana/web3.js";
import { sleep } from "./sleep";

export interface BroadcastOptions extends SaberBroadcastOptions {
  resend?: number;
  commitment?: Finality;
}
export class RetriableTransactionEnvelope extends SaberTransactionEnvelope {
  static from(envelope: SaberTransactionEnvelope) {
    return new RetriableTransactionEnvelope(
      envelope.provider,
      envelope.instructions,
      envelope.signers
    );
  }

  partition(): RetriableTransactionEnvelope[] {
    const txns = super.partition();
    return txns.map((envelope) => RetriableTransactionEnvelope.from(envelope));
  }

  async confirmAll(opts?: BroadcastOptions): Promise<TransactionReceipt[]> {
    const receipts: TransactionReceipt[] = [];
    const txns = this.partition();
    for (const txn of txns) {
      receipts.push(await txn.confirm(opts));
    }
    return receipts;
  }

  async confirm(opts?: BroadcastOptions): Promise<TransactionReceipt> {
    if (!opts || !opts.resend) {
      return super.confirm(opts);
    }
    for (let i = 0; i < opts.resend; i++) {
      try {
        const signed = await this.provider.signer.sign(
          this.build(),
          this.signers,
          opts
        );
        const pendingTx = await this.provider.broadcaster.broadcast(signed);
        return await pendingTx.wait({
          ...opts,
          retries: 12,
          minTimeout: 60000,
        });
      } catch (e) {
        await sleep(3000);
        console.error(e);
        // just ignore the error and send the tx with new blockhash
        continue;
      }
    }
    throw new Error("timeout");
  }
}
