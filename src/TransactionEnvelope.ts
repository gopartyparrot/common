import {
  BroadcastOptions as SaberBroadcastOptions,
  TransactionEnvelope as SaberTransactionEnvelope,
  TransactionReceipt,
} from "@saberhq/solana-contrib";
import { Finality } from "@solana/web3.js";

export interface BroadcastOptions extends SaberBroadcastOptions {
  retry?: boolean;
  commitment?: Finality;
}

export class TransactionEnvelope extends SaberTransactionEnvelope {
  async confirm(opts?: BroadcastOptions): Promise<TransactionReceipt> {
    if (!opts || !opts.retry) {
      return super.confirm(opts);
    }
    while (true) {
      try {
        const signed = await this.provider.signer.sign(
          this.build(),
          this.signers,
          opts
        );
        const pendingTx = await this.provider.broadcaster.broadcast(
          signed,
          opts
        );
        return pendingTx.pollForReceipt({
          commitment: opts.commitment ?? "finalized",
        });
      } catch (e) {
        // just ignore the error and send the tx with new blockhash
        continue;
      }
    }
  }
}
