import { PublicKey } from "@solana/web3.js";
import pump from "./pump_0.1.0.json";
import amm from "./pump_amm_0.1.0.json";

export const PUMPFUN_PROGRAM_ADDRESS =
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

export const PUMPFUN_AMM_PROGRAM_ID =
  "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA";

export const PUMPFUN_MIGRATION_SIGNER =
  "39azUYFWPz3VHgKCf3VChUwbpURdCHRxjWVowf5jUJjg";

export const pumpfun = {
  globalAccount: new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"),
  programID: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
  feeRecipient: new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"),
  feeReceipient_test: new PublicKey(
    "68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg",
  ),
  systemProgram: new PublicKey("11111111111111111111111111111111"),
  tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
  mplTokenMetadata: new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  ),
  associatedTokenProgram: new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  ),
  eventAuthority: new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"),
};

export type PumpFunEvent =
  | "CreateEvent"
  | "TradeEvent"
  | "CompleteEvent"
  | "SetParamsEvent";

export const SOL_DECIMALS = 9;
export const TOKEN_DECIMALS = 6; //TODO:确定下是不是都是这么多

export const pumpfunErrorMap = pump.errors.reduce(
  (acc, e) => {
    acc[e.code] = e.msg || "unknown error";
    return acc;
  },
  {} as Record<number, string>,
);

export const ammErrorMap = amm.errors.reduce(
  (acc, e) => {
    acc[e.code] = e.name;
    return acc;
  },
  {} as Record<number, string>,
);


export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);

export type DEXProgramName = "raydiumClmm" | "meteoraDLMM" | "unknown";

export const MeteoraDLMMProgramId = new PublicKey(
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
);

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDT_MINT = "Es9vMFrzaCERmJfr21PGCg5vXxK14VvWpsLVVVrYkpUMv";
export const NATIVE_SOL = "11111111111111111111111111111111";
export const NATIVE_SOL_MINT = "11111111111111111111111111111111";

export const SOL_MINT_KEY = new PublicKey(SOL_MINT);
