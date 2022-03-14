"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetriableTransactionEnvelope = void 0;
const solana_contrib_1 = require("@saberhq/solana-contrib");
const common_1 = require("@project-serum/common");
class RetriableTransactionEnvelope extends solana_contrib_1.TransactionEnvelope {
    static from(envelope) {
        return new RetriableTransactionEnvelope(envelope.provider, envelope.instructions, envelope.signers);
    }
    partition() {
        const txns = super.partition();
        return txns.map((envelope) => RetriableTransactionEnvelope.from(envelope));
    }
    async confirmAll(opts) {
        const receipts = [];
        const txns = this.partition();
        for (const txn of txns) {
            receipts.push(await txn.confirm(opts));
        }
        return receipts;
    }
    async confirm(opts) {
        if (!opts || !opts.resend) {
            return super.confirm(opts);
        }
        for (let i = 0; i < opts.resend; i++) {
            try {
                const signed = await this.provider.signer.sign(this.build(), this.signers, opts);
                const pendingTx = await this.provider.broadcaster.broadcast(signed);
                return await pendingTx.wait({
                    ...opts,
                    retries: 12,
                    minTimeout: 60000,
                });
            }
            catch (e) {
                await (0, common_1.sleep)(3000);
                // just ignore the error and send the tx with new blockhash
                continue;
            }
        }
        throw new Error("timeout");
    }
}
exports.RetriableTransactionEnvelope = RetriableTransactionEnvelope;
