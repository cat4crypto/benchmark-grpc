import { RawAccountResult } from "../client";
import * as splToken from "@solana/spl-token";
import bs58 from "bs58";

export type AccountResult = {
  account: {
    pubkey: string;
    lamports: string;
    owner: string;
    data: splToken.RawAccount;
  };
  slot: string;
  isStartup: boolean;
};

export function convertAccount({
  account: { pubkey, lamports, owner, data },
  slot,
  isStartup,
}: RawAccountResult): AccountResult {
  return {
    account: {
      pubkey: bs58.encode(pubkey),
      lamports,
      owner: bs58.encode(owner),
      data: splToken.AccountLayout.decode(data),
    },
    slot,
    isStartup,
  };
}
