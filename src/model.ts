export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;          // YYYY-MM-DD
  amount: number;        // positive number
  type: TxType;          // income/expense
  asset: "salary" | "stock_sell" | "bond_sell" | "cash" | "other";
  label?: string;
  estimated?: boolean;
};

export type FundingLink = {
  id: string;
  expenseTxId: string;   // target expense
  sourceTxIds: string[]; // origins (incomes or proceeds)
};

export type Doc = {
  version: 1;
  transactions: Transaction[];
  links: FundingLink[];
};

