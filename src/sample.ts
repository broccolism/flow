import type { Doc } from "./model";

export const sampleDoc: Doc = {
  version: 1,
  transactions: [
    { id: "t1", date: "2023-01-25", amount: 2500000, type: "income", asset: "salary", label: "Salary Jan" },
    { id: "t2", date: "2023-02-25", amount: 5500000, type: "income", asset: "salary", label: "Salary Feb" },
    { id: "t3", date: "2023-03-10", amount: 12000000, type: "income", asset: "stock_sell", label: "Stock sale Mar" },
    { id: "t4", date: "2023-08-19", amount: 18000000, type: "income", asset: "stock_sell", label: "Stock sale Aug" },
    { id: "t5", date: "2023-11-08", amount: 8000000, type: "income", asset: "bond_sell", label: "Bond sale Nov", estimated: true },
    { id: "t6", date: "2023-12-20", amount: 40000000, type: "expense", asset: "cash", label: "Home purchase" }
  ],
  links: [
    { id: "l1", expenseTxId: "t6", sourceTxIds: ["t1","t2","t3","t4","t5"] }
  ]
};

