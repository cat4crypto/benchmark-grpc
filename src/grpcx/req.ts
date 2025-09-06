import {
  CommitmentLevel,
  SubscribeRequest,
} from "@triton-one/yellowstone-grpc";

export const baseReq = {
  accounts: {},
  slots: {},
  transactions: {
    common: {
      vote: false,
      failed: false,
      signature: undefined,
      accountInclude: [],
      accountExclude: [],
      accountRequired: [],
    },
  },
  transactionsStatus: {},
  entry: {},
  blocks: {},
  blocksMeta: {},
  accountsDataSlice: [],
  ping: undefined,
  commitment: CommitmentLevel.PROCESSED, //for receiving confirmed txn updates
} as const satisfies SubscribeRequest;
