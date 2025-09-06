import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  describe,
  it,
} from "vitest";

import { TransactionFormatter } from "../transaction-formatter";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
describe("TransactionFormatter", () => {
  it("should format the transaction", () => {
    const file = path.join(__dirname, "./resp.json");
    const txFormatter = new TransactionFormatter();
    const tx = JSON.parse(fs.readFileSync(file, "utf8"));
    console.log("tx", tx);
    const txn = txFormatter.formTransactionFromJson(tx.transaction);
    console.log(txn);
  });
});
