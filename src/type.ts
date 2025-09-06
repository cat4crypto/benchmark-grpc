import BN from "bn.js";

import { PublicKey } from "@solana/web3.js";

export type RawCreateEvent = {
  name: string;
  data: {
    name: string;
    symbol: string;
    uri: string;
    mint: PublicKey;
    bonding_curve: PublicKey;
    user: PublicKey;
    creator: PublicKey;
    timestamp: BN;
    token_total_supply: BN;
    virtual_token_reserves: BN;
    virtual_sol_reserves: BN;
    real_token_reserves: BN;
  };
};
export type MyCreateEvent = Omit<
  RawCreateEvent["data"],
  | "bonding_curve"
  | "timestamp"
  | "virtual_token_reserves"
  | "virtual_sol_reserves"
  | "real_token_reserves"
> & {
  // bondingCurve: string;
  createdAt: string;
  receivedAt: string;
};
export type MyCompleteEvent = {
  user: PublicKey;
  mint: PublicKey;
  bonding_curve: PublicKey;
  timestamp: BN;
};

export type MyMigrateEvent = {
  user: PublicKey;
  mint: PublicKey;
  bonding_curve: PublicKey;
  timestamp: BN;
};

export type TradeEventWithName = {
  name: "TradeEvent";
  data: MyTradeEvent;
};
export type MyTradeEvent = {
  mint: PublicKey;
  sol_amount: BN;
  token_amount: BN;
  is_buy: boolean;
  user: PublicKey;
  timestamp: BN;
  virtual_sol_reserves: BN;
  virtual_token_reserves: BN;
  real_sol_reserves: BN;
  real_token_reserves: BN;
};

export type BuyEvent = {
  timestamp: number;
  base_amount_out: BN;
  max_quote_amount_in: BN;
  user_base_token_reserves: BN;
  user_quote_token_reserves: BN;
  pool_base_token_reserves: BN;
  pool_quote_token_reserves: BN;
  quote_amount_in: BN;
  lp_fee_basis_points: BN;
  lp_fee: BN;
  protocol_fee_basis_points: BN;
  protocol_fee: BN;
  quote_amount_in_with_lp_fee: BN;
  user_quote_amount_in: BN;
  pool: PublicKey;
  user: PublicKey;
  user_base_token_account: PublicKey;
  user_quote_token_account: PublicKey;
  protocol_fee_recipient: PublicKey;
  protocol_fee_recipient_token_account: PublicKey;
};

export type SellEvent = {
  timestamp: BN;
  base_amount_in: BN;
  min_quote_amount_out: BN;
  user_base_token_reserves: BN;
  user_quote_token_reserves: BN;
  pool_base_token_reserves: BN;
  pool_quote_token_reserves: BN;
  quote_amount_out: BN;
  lp_fee_basis_points: BN;
  lp_fee: BN;
  protocol_fee_basis_points: BN;
  protocol_fee: BN;
  quote_amount_out_without_lp_fee: BN;
  user_quote_amount_out: BN;
  pool: PublicKey;
  user: PublicKey;
  user_base_token_account: PublicKey;
  user_quote_token_account: PublicKey;
  protocol_fee_recipient: PublicKey;
  protocol_fee_recipient_token_account: PublicKey;
};

export type CreatePoolEvent = {
  timestamp: BN;
  index: number;
  creator: PublicKey;
  base_mint: PublicKey;
  quote_mint: PublicKey;
  base_mint_decimals: number;
  quote_mint_decimals: number;
  base_amount_in: BN;
  quote_amount_in: BN;
  pool_base_amount: BN;
  pool_quote_amount: BN;
  minimum_liquidity: BN;
  initial_liquidity: BN;
  lp_token_amount_out: BN;
  pool_bump: number;
  pool: PublicKey;
  lp_mint: PublicKey;
  user_base_token_account: PublicKey;
  user_quote_token_account: PublicKey;
};
