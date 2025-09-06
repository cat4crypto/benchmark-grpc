import dayjs from "dayjs";

import { run } from "@autoclickpro/run";

import { createPfGrpcClient } from "./src/grpc";

run({
  start() {
    const res1: number[] = [];
    const client1 = createPfGrpcClient(
      "https://solana-yellowstone-grpc.publicnode.com:443",
      ""
    );
    // "http://37.114.51.69:10900",
    // "NbGKPFXCWuBvf9Ss623VQ5DA"
    client1.onToken({
      onCreate: async ({ metadata, sig, amm, ext }) => {
        const diff = dayjs().diff(dayjs(metadata.createdAt));
        res1.push(diff);
        console.log({
          mint: metadata.mint,
          diff,
          avg1: res1.reduce((a, b) => a + b, 0) / res1.length,
          avg2: res2.reduce((a, b) => a + b, 0) / res2.length,
        });
      },
    });

    const res2: number[] = [];
    const client2 = createPfGrpcClient("http://37.114.51.69:10900", "");
    // "http://37.114.51.69:10900",
    // "NbGKPFXCWuBvf9Ss623VQ5DA"
    client2.onToken({
      onCreate: async ({ metadata, sig, amm, ext }) => {
        const diff = dayjs().diff(dayjs(metadata.createdAt));
        res2.push(diff);
        console.log({
          mint: metadata.mint,
          diff,
          avg2: res2.reduce((a, b) => a + b, 0) / res2.length,
          avg1: res1.reduce((a, b) => a + b, 0) / res1.length,
        });
      },
    });
  },
});
