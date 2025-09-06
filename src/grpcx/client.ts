import Client, {
  CommitmentLevel,
  SubscribeRequestAccountsDataSlice,
  SubscribeRequestFilterAccounts,
  SubscribeRequestFilterBlocks,
  SubscribeRequestFilterBlocksMeta,
  SubscribeRequestFilterEntry,
  SubscribeRequestFilterSlots,
  SubscribeRequestFilterTransactions,
  SubscribeUpdate,
} from "@triton-one/yellowstone-grpc";
import { TransactionFormatter } from "./transaction-formatter";

export type RawAccountResult = {
  account: {
    pubkey: Buffer;
    lamports: string;
    owner: Buffer;
    data: Buffer;
    executable: boolean;
    rentEpoch: string;
    writeVersion: string;
    tokenAmount: string;
  };
  slot: string;
  isStartup: boolean;
};
export type ShftResponse = SubscribeUpdate;

export interface SubscribeRequest {
  accounts: { [key: string]: SubscribeRequestFilterAccounts };
  slots: { [key: string]: SubscribeRequestFilterSlots };
  transactions: { [key: string]: SubscribeRequestFilterTransactions };
  transactionsStatus: { [key: string]: SubscribeRequestFilterTransactions };
  blocks: { [key: string]: SubscribeRequestFilterBlocks };
  blocksMeta: { [key: string]: SubscribeRequestFilterBlocksMeta };
  entry: { [key: string]: SubscribeRequestFilterEntry };
  commitment?: CommitmentLevel | undefined;
  accountsDataSlice: SubscribeRequestAccountsDataSlice[];
  ping?: any | undefined;
}

async function subStream(
  client: Client,
  args: SubscribeRequest,
  cb: (data: SubscribeUpdate, stream: any) => void,
) {
  // Subscribe for events
  const stream = await client.subscribe();

  // Create `error` / `end` handler
  const streamClosed = new Promise<void>((resolve, reject) => {
    stream.on("error", (error) => {
      console.log("ERRRORORROROROR", error);
      reject(error);
      stream.end();
    });
    stream.on("end", () => {
      resolve();
    });
    stream.on("close", () => {
      resolve();
    });
  });

  // Handle updates
  stream.on("data", (data: SubscribeUpdate) => {
    cb(data, stream);
  });

  // Send subscribe request
  await new Promise<void>((resolve, reject) => {
    stream.write(args, (err: unknown) => {
      if (err === null || err === undefined) {
        console.log("SUBSCRIBED");
        resolve();
      } else {
        console.log("SUBSCRIBED ERROR", err);
        reject(err);
      }
    });
  }).catch((reason) => {
    console.error(reason);
    throw reason;
  });

  // 为保证连接稳定，需要定期向服务端发送ping请求以维持连接
  const pingRequest: SubscribeRequest = {
    accounts: {},
    slots: {},
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
    accountsDataSlice: [],
    commitment: undefined,
    ping: { id: 1 },
  };
  // 每5秒发送一次ping请求
  // setInterval(async () => {
  //   await new Promise<void>((resolve, reject) => {
  //     stream.write(pingRequest, (err: any) => {
  //       if (err === null || err === undefined) {
  //         resolve();
  //       } else {
  //         console.log("PING ERROR", err);
  //         reject(err);
  //       }
  //     });
  //   }).catch((reason) => {
  //     console.error(reason);
  //     throw reason;
  //   });
  // }, 5000);

  await streamClosed;
}

//@ts-ignore
const ClientClass = typeof Client === "function" ? Client : Client.default;
export const makeGrpcClient = (endpoint: string, xToken: string) => {
  const client: Client = new ClientClass(endpoint, xToken, {});
  return {
    sub: async (
      req: SubscribeRequest,
      cb: (data: SubscribeUpdate, stream: any) => void,
    ) => {
      //重试
      while (true) {
        try {
          await subStream(client, req, cb);
          break;
        } catch (error) {
          console.error("Stream error, restarting in 1 second...", error);
          // await sleep(1000 * 2);
          // await
        }
      }
    },
    client: client,
  };
};
