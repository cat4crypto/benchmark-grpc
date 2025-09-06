import { utils } from "@coral-xyz/anchor";
import {
  ConfirmedTransactionMeta,
  Message,
  MessageV0,
  PublicKey,
  VersionedMessage,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import {
  SubscribeUpdateTransaction,
  SubscribeUpdateTransactionInfo,
} from "@triton-one/yellowstone-grpc";

export type RawMessage = NonNullable<
  NonNullable<SubscribeUpdateTransactionInfo["transaction"]>["message"]
>;
export type TransactionStatusMeta = NonNullable<
  SubscribeUpdateTransactionInfo["meta"]
>;
export const uArrayToBase58 = (data: Uint8Array<ArrayBufferLike>) => {
  return utils.bytes.bs58.encode(Buffer.from(data));
};
export class TransactionFormatter {
  public formTransactionFromJson(
    data: SubscribeUpdateTransaction,
  ): VersionedTransactionResponse {
    const rawTx = data["transaction"] as SubscribeUpdateTransactionInfo;
    return {
      slot: +data.slot,
      version: rawTx.transaction?.message?.versioned ? 0 : "legacy",
      blockTime: Date.now(),//TODO:这里没法获取到blockTime
      meta: this.formMeta(rawTx.meta!),
      transaction: {
        signatures: rawTx.transaction?.signatures.map(uArrayToBase58) || [],
        message: this.formTxnMessage(rawTx.transaction?.message!),
      },
    };
  }

  private formTxnMessage(message: RawMessage): VersionedMessage {
    if (!message.versioned) {
      return new Message({
        header: {
          numRequiredSignatures: message.header!.numRequiredSignatures,
          numReadonlySignedAccounts: message.header!.numReadonlySignedAccounts,
          numReadonlyUnsignedAccounts:
            message.header!.numReadonlyUnsignedAccounts,
        },
        recentBlockhash: uArrayToBase58(message.recentBlockhash),
        accountKeys: (message.accountKeys || []).map(
          (d: Uint8Array<ArrayBufferLike>) => new PublicKey(d),
        ),
        instructions: message.instructions.map(
          ({ data, programIdIndex, accounts }) => ({
            programIdIndex: programIdIndex,
            accounts: Array.from(accounts),
            data: uArrayToBase58(data),
          }),
        ),
      });
    } else {
      return new MessageV0({
        header: {
          numRequiredSignatures: message.header!.numRequiredSignatures,
          numReadonlySignedAccounts: message.header!.numReadonlySignedAccounts,
          numReadonlyUnsignedAccounts:
            message.header!.numReadonlyUnsignedAccounts,
        },
        recentBlockhash: uArrayToBase58(message.recentBlockhash),
        staticAccountKeys: (message.accountKeys || []).map(
          (k: Uint8Array<ArrayBufferLike>) => new PublicKey(k),
        ),
        compiledInstructions: message.instructions.map(
          ({ programIdIndex, accounts, data }) => ({
            programIdIndex: programIdIndex,
            accountKeyIndexes: Array.from(accounts),
            data: data,
          }),
        ),
        addressTableLookups:
          message.addressTableLookups?.map(
            ({ accountKey, writableIndexes, readonlyIndexes }) => ({
              writableIndexes: Array.from(writableIndexes),
              readonlyIndexes: Array.from(readonlyIndexes),
              accountKey: new PublicKey(accountKey),
            }),
          ) || [],
      });
    }
  }

  private formMeta(meta: TransactionStatusMeta): ConfirmedTransactionMeta {
    return {
      err: meta.err || null,
      fee: +meta.fee,
      preBalances: meta.preBalances.map((b) => +b),
      postBalances: meta.postBalances.map((b) => +b),
      //@ts-ignore
      preTokenBalances: meta.preTokenBalances || [],
      //@ts-ignore
      postTokenBalances: meta.postTokenBalances || [],
      logMessages: meta.logMessages || [],
      loadedAddresses: {
        writable:
          meta.loadedWritableAddresses?.map(
            (address: Uint8Array<ArrayBufferLike>) => new PublicKey(address),
          ) || [],
        readonly:
          meta.loadedReadonlyAddresses?.map(
            (address: Uint8Array<ArrayBufferLike>) => new PublicKey(address),
          ) || [],
      },
      innerInstructions:
        meta.innerInstructions?.map(({ index, instructions }) => ({
          index: index || 0,
          instructions: instructions.map((instruction) => ({
            programIdIndex: instruction.programIdIndex,
            accounts: Array.from(instruction.accounts),
            data: uArrayToBase58(instruction.data),
          })),
        })) || [],
    };
  }
}
