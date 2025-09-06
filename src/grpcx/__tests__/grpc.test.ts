import { CommitmentLevel } from "@triton-one/yellowstone-grpc";
import { makeGrpcClient, SubscribeRequest } from "../client";
import { describe, it } from "vitest";
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


describe("makeGrpcClient", () => {
  it("should create a grpc client", () => {
    const client = makeGrpcClient(
      "http://37.114.51.69:10900",
      "NbGKPFXCWuBvf9Ss623VQ5DA",
    );
    client.sub(baseReq, (data) => {
      console.log(data);
    });
  });
});
