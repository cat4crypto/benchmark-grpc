import BN from "bn.js";
import * as _ from "lodash-es";
import dayjs from "dayjs";

import {
  baseReq,
  CreateGrpcClient,
  decodeEvent,
  decodeTxn,
  GrpcClient,
  makeGrpcClient,
  OnTokenArgObject,
  SubscribeRequest,
  transformRawGrpcTx2VersionedTx,
} from "./grpcx";
import { Idl } from "@coral-xyz/anchor";
import { VersionedTransactionResponse } from "@solana/web3.js";
import { getMemePrice } from "./price";

import {
  PUMPFUN_AMM_PROGRAM_ID,
  PUMPFUN_PROGRAM_ADDRESS,
  SOL_MINT,
} from "./const";
import pumpFunIdl from "./pump_0.1.0.json";
import pumpFunAmmIdl from "./pump_amm_0.1.0.json";
import {
  BuyEvent,
  CreatePoolEvent,
  MyCompleteEvent,
  MyTradeEvent,
  RawCreateEvent,
  SellEvent,
} from "./type";

export const createPfGrpcClient: CreateGrpcClient = (
  grpcUrl: string = process.env.GRPC_URL!,
  xToken: string = process.env.GRPC_XTOKEN!
): GrpcClient => {
  const grpcClient = makeGrpcClient(grpcUrl, xToken);
  return {
    onToken: ({
      onCreate,
      onTrade,
      onCreatePool,
      onMigrate,
      onComplete,
    }: OnTokenArgObject) => {
      const req: SubscribeRequest = {
        ...baseReq,
        transactions: {
          ...baseReq.transactions,
          pumpfun: {
            ...baseReq.transactions.common,
            accountInclude: [PUMPFUN_PROGRAM_ADDRESS],
          },
          // pumpswap: {
          // ...baseReq.transactions.pumpswap,
          // accountInclude: [PUMPFUN_AMM_PROGRAM_ID],
          // },
        },
      };
      return grpcClient.sub(req, async (data) => {
        if (!data.transaction) {
          return;
        }
        if (data.filters.includes("pumpfun")) {
          const txn = transformRawGrpcTx2VersionedTx(data.transaction);
          processPumpFunTx(txn, onCreate, onTrade, onComplete);
        }
        if (data.filters.includes("pumpswap")) {
          const txn = transformRawGrpcTx2VersionedTx(data.transaction);
          processPumpSwapTx(txn, onTrade);
        }
      });
    },
  };
};

export const processPumpFunTx = (
  txn: VersionedTransactionResponse,
  onCreate: OnTokenArgObject["onCreate"],
  onTrade: OnTokenArgObject["onTrade"],
  onComplete?: OnTokenArgObject["onComplete"]
) => {
  let events = decodeEvent(txn, pumpFunIdl as Idl, PUMPFUN_PROGRAM_ADDRESS);
  for (const event of events) {
    switch (event.name) {
      case "CreateEvent": {
        const data = event.data as RawCreateEvent["data"];
        onCreate?.({
          metadata: {
            mint: data.mint.toBase58(),
            supply: BigInt(data.token_total_supply.toString()),
            name: data.name,
            symbol: data.symbol,
            description: "",
            image: "",
            uri: data.uri,
            creator: data.creator.toBase58(),
            decimals: 6, //TODO:
            createdAt: dayjs(data.timestamp.toNumber() * 1000).format(),
            platform: "pumpfun",
          },
          sig: txn.transaction.signatures[0],
          amm: "pumpfun",
        });
        break;
      }
      case "TradeEvent": {
        const data = event.data as MyTradeEvent;
        const baseIsSol = false; //内盘上应该base一定不是sol
        const price = getMemePrice(
          new BN(data.virtual_token_reserves.toString()),
          new BN(data.virtual_sol_reserves.toString()),
          baseIsSol
        );
        onTrade?.({
          mint: data.mint.toBase58(),
          price,
          tokenAmount: BigInt(data.token_amount.toString()),
          solAmount: BigInt(data.sol_amount.toString()),
          direction: data.is_buy ? "buy" : "sell",
          ts: data.timestamp.toNumber(),
          amm: "pumpfun",
          sig: txn.transaction.signatures[0],
          user: data.user.toBase58(),
          blockId: txn.slot,
        });

        break;
      }
      case "CompleteEvent": {
        const cevent = event.data as MyCompleteEvent;
        onComplete?.(cevent.mint.toBase58(), cevent, txn);
        break;
      }
    }
  }
};

export function getBaseMint(ix: any) {
  const baseMint = ix?.accounts.find((e: any) => e.name === "base_mint")
    ?.pubkey as unknown as string;
  return baseMint;
}

export function getQuoteMint(ix: any) {
  const quoteMint = ix?.accounts.find((e: any) => e.name === "quote_mint")
    ?.pubkey as unknown as string;
  return quoteMint;
}

export const processSellEvent = (event: SellEvent, parsedTxn: any) => {
  const ix = parsedTxn.instructions.find((ix: any) => ix.name === "sell");
  const baseMint = getBaseMint(ix);
  const quoteMint = getQuoteMint(ix);
  const baseIsSol = baseMint === SOL_MINT;
  const { base_amount_in, quote_amount_out } = event as SellEvent;
  const price = getMemePrice(
    new BN(base_amount_in.toString()),
    new BN(quote_amount_out.toString()),
    baseIsSol
  );

  const mint = baseIsSol ? quoteMint : baseMint;
  const solAmount = baseIsSol
    ? BigInt(base_amount_in.toString())
    : BigInt(quote_amount_out.toString());
  const tokenAmount = baseIsSol
    ? BigInt(quote_amount_out.toString())
    : BigInt(base_amount_in.toString());
  return {
    mint,
    price,
    tokenAmount,
    solAmount,
    user: event.user,
  };
};
export const processBuyEvent = (event: BuyEvent, parsedTxn: any) => {
  const ix = parsedTxn.instructions.find((ix: any) => ix.name === "buy");
  const baseMint = getBaseMint(ix);
  const quoteMint = getQuoteMint(ix);
  if (!baseMint) {
    throw "mint is null";
  }

  const baseIsSol = baseMint === SOL_MINT;

  //TODO:这个算出来的应该是成交时刻的价格,Gmgn上好像也是这个价格
  const { base_amount_out, quote_amount_in } = event as BuyEvent;
  const price = getMemePrice(
    new BN(base_amount_out.toString()),
    new BN(quote_amount_in.toString()),
    baseIsSol
  );
  const mint = baseIsSol ? quoteMint : baseMint;
  const solAmount = baseIsSol
    ? BigInt(base_amount_out.toString())
    : BigInt(quote_amount_in.toString());
  const tokenAmount = baseIsSol
    ? BigInt(quote_amount_in.toString())
    : BigInt(base_amount_out.toString());
  return {
    mint,
    price,
    user: event.user,
    tokenAmount,
    solAmount,
  };
};
export const processCreatePoolEvent = (
  event: CreatePoolEvent,
  parsedTxn: any
) => {
  const ix = parsedTxn.instructions.find(
    (ix: any) => ix.name === "create_pool"
  );
  const baseMint = getBaseMint(ix);
  const quoteMint = getQuoteMint(ix);
  if (!baseMint || !quoteMint) {
    throw "mint is null";
  }
  const baseIsSol = baseMint === SOL_MINT;
  const { base_amount_in, quote_amount_in, pool } = event;
  const price = getMemePrice(
    new BN(base_amount_in.toString()),
    new BN(quote_amount_in.toString()),
    baseIsSol
  );
  const mint = baseIsSol ? quoteMint : baseMint;
  // onCreatePool?.(mint, price, pool, event.data, txn);
  // if (isMigrateByPumpFun) {
  //   onMigrate?.(mint, price, pool, event.data, txn);
  // }
  return {
    mint,
    price,
    pool,
  };
};

export const processPumpSwapTx = (
  txn: VersionedTransactionResponse,
  onTrade: OnTokenArgObject["onTrade"]
) => {
  const parsedTxn = decodeTxn(
    txn,
    PUMPFUN_AMM_PROGRAM_ID,
    pumpFunAmmIdl as Idl
  );
  for (const event of parsedTxn.events) {
    switch (event.name) {
      case "BuyEvent": {
        const { mint, price, tokenAmount, solAmount, user } = processBuyEvent(
          event.data as BuyEvent,
          parsedTxn
        );
        onTrade?.({
          mint,
          price,
          tokenAmount,
          solAmount,
          direction: "buy",
          ts: event.data.timestamp,
          amm: "pumpswap",
          sig: txn.transaction.signatures[0],
          user: user.toBase58(),
          blockId: txn.slot,
        });
        break;
      }
      case "SellEvent": {
        const { mint, price, tokenAmount, solAmount, user } = processSellEvent(
          event.data as SellEvent,
          parsedTxn
        );
        onTrade?.({
          mint,
          price,
          tokenAmount,
          solAmount,
          direction: "sell",
          ts: event.data.timestamp,
          amm: "pumpswap",
          sig: txn.transaction.signatures[0],
          user: user.toBase58(),
          blockId: txn.slot,
        });
        break;
      }
      case "CreatePoolEvent": {
        throw new Error("not implemented");
        // const { mint, price, pool } = processCreatePoolEvent(
        //   event.data,
        //   parsedTxn,
        // );
        // onCreatePool?.(mint, price, pool, event.data, txn);
        // if (isMigrateByPumpFun) {
        //   onMigrate?.(mint, price, pool, event.data, txn);
        // }
        break;
      }
      default:
        continue;
    }
  }
};
