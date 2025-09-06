import * as _ from "lodash-es";

import {
  flattenTransactionResponse,
  ParsedInstruction,
  SolanaParser,
} from "@autoclickpro/solana-transaction-parser";
import {
  BorshCoder,
  EventParser,
  Idl,
} from "@coral-xyz/anchor";
import {
  ParsedTransactionWithMeta,
  PublicKey,
  TransactionInstruction,
  TransactionResponse,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { SubscribeUpdateTransaction } from "@triton-one/yellowstone-grpc";

import { TransactionFormatter } from "./transaction-formatter";

const TXN_FORMATTER = new TransactionFormatter();
const LOG_DISCRIMINATOR = Buffer.from([
  0xe4, 0x45, 0xa5, 0x2e, 0x51, 0xcb, 0x9a, 0x1d,
]);
export type DecodedResult = {
  instructions: ParsedInstruction<Idl, string>[];
  events: { name: string; data: any }[];
};
export function decodeTxn(
  tx: VersionedTransactionResponse | TransactionResponse,
  programId: string,
  idl: Idl,
  option = { ix: true, event: true },
): DecodedResult {
  if (tx.meta?.err) {
    console.log("tx.meta?.err", tx.meta?.err);
    return {
      instructions: [],
      events: [],
    };
  }
  const result: {
    instructions: ParsedInstruction<Idl, string>[];
    events: { name: string; data: any }[];
  } = {
    instructions: [],
    events: [],
  };
  const parser = new SolanaParser([
    {
      idl,
      programId: new PublicKey(programId),
    },
  ]);
  if (option?.ix) {
    result.instructions = flattenTransactionResponse(tx)
      .filter((ix) => ix.programId.equals(new PublicKey(programId)))
      .map((ix) => parser.parseInstruction(ix));
  }
  if (option?.event) {
    result.events = decodeEvent(tx, idl, programId);
  }
  return result;
}

export const decodeIx = (
  tx: VersionedTransactionResponse,
  programId: string,
  idl: Idl,
): ParsedInstruction<Idl, string>[] => {
  const parser = new SolanaParser([
    {
      idl,
      programId: new PublicKey(programId),
    },
  ]);
  return flattenTransactionResponse(tx)
    .filter((ix) => ix.programId.equals(new PublicKey(programId)))
    .map((ix) => parser.parseInstruction(ix));
};

export const transformRawGrpcTx2VersionedTx = (
  tx: SubscribeUpdateTransaction,
) => {
  return TXN_FORMATTER.formTransactionFromJson(tx);
};

export const decodeEvent = (
  txn: VersionedTransactionResponse | ParsedTransactionWithMeta,
  idl: Idl,
  programId: string,
) => {
  const decoder = new BorshCoder(idl);
  const eventParser = new EventParser(new PublicKey(programId), decoder);
  return Array.from(eventParser.parseLogs(txn?.meta?.logMessages as string[]));
};

export const parseAnchorSelfCpiIx = (
  txn: VersionedTransactionResponse,
  idl: Idl,
  programId: PublicKey,
) => {
  const flattenedIxs = flattenTransactionResponse(txn);
  return parseAnchorSelfCpiIxByIxList(flattenedIxs, programId, idl);
};
export const parseAnchorSelfCpiIxByIxList = (
  flattenedIxs: TransactionInstruction[],
  programId: PublicKey,
  idl: Idl,
) => {
  const coder = new BorshCoder(idl);
  const ixList = flattenedIxs.filter(
    (ix) =>
      ix.programId.equals(programId) &&
      LOG_DISCRIMINATOR.equals(ix.data.subarray(0, 8)),
  );
  return ixList.map((ix) => {
    const eventData = ix.data.subarray(8);
    return coder.events.decode(Buffer.from(eventData).toString("base64"));
  });
};
