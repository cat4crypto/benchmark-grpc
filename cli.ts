import { run } from "@autoclickpro/run";
import { baseReq } from "./src/grpcx/req";
import { makeGrpcClient } from "./src/grpcx/client";
import { createPfGrpcClient } from "./src/grpc";
import dayjs from "dayjs";
run({
  start() {
    const client = createPfGrpcClient(
      "https://solana-yellowstone-grpc.publicnode.com:443",
      ""
    );
    // "http://37.114.51.69:10900",
    // "NbGKPFXCWuBvf9Ss623VQ5DA"
    client.onToken({
      onCreate: async ({ metadata, sig, amm, ext }) => {
        const diff = dayjs().diff(dayjs(metadata.createdAt));
        console.log({
          mint: metadata.mint,
          diff,
        });
      },
    });
  },
});
