import dayjs from "dayjs";

import { run } from "@autoclickpro/run";

import { createPfGrpcClient } from "./src/grpc";

run({
  start() {
    const res: number[] = [];
    const client = createPfGrpcClient(
      "https://solana-yellowstone-grpc.publicnode.com:443",
      ""
    );
    // "http://37.114.51.69:10900",
    // "NbGKPFXCWuBvf9Ss623VQ5DA"
    client.onToken({
      onCreate: async ({ metadata, sig, amm, ext }) => {
        const diff = dayjs().diff(dayjs(metadata.createdAt));
        res.push(diff);
        console.log({
          mint: metadata.mint,
          diff,
          avg: res.reduce((a, b) => a + b, 0) / res.length,
        });
      },
    });
  },
});
