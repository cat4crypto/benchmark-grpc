import { VersionedTransactionResponse } from "@solana/web3.js";

// import { TokenMetaData } from "../token";

export type Amm = "pumpfun" | "pumpswap" | "bonk" | "unknown";
export type OnCreateArg = {
  metadata: any;
  sig: string;
  amm: Amm;
  ext?: any;
};
export type OnTradeArg = {
  mint: string;
  price: number;
  tokenAmount: bigint;
  solAmount: bigint;
  direction: "buy" | "sell";
  ts: number; //单位秒,链上时间戳
  amm: Amm;
  sig: string;
  user: string; //pubkey
  blockId: number;
};
export type OnTokenArgObject = {
  onCreate?: (arg: OnCreateArg) => Promise<void>;
  onTrade?: (arg: OnTradeArg) => Promise<void>;
  onMigrate?: (
    mint: string,
    price: number,
    pool: string,
    event: any,
    txn: VersionedTransactionResponse,
  ) => Promise<void>;
  onCreatePool?: (
    mint: string,
    price: number,
    pool: string,
    event: any,
    txn: VersionedTransactionResponse,
  ) => Promise<void>;
  onComplete?: (
    mint: string,
    event: any,
    txn: VersionedTransactionResponse,
  ) => Promise<void>;
};

export type GrpcClient = {
  init?: (condition: any) => Promise<void>;
  onToken: (arg: OnTokenArgObject) => void;
};

export type CreateGrpcClient = (
  grpcUrl: string,
  xToken: string,
  programIds?: string[],
) => GrpcClient;
