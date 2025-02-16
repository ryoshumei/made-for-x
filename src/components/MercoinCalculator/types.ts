export interface Transaction {
  取引種別: string;
  通貨ペア: string;
  増加数量: number;
  減少数量: number;
  約定金額: number;
  増加通貨名: string;
}

export interface ProfitResult {
  profit: number;
  totalBuy: number;
  totalSell: number;
  totalBuyQuantity: number;
  totalSellQuantity: number;
  buyTransactions: {
    type: string;
    pair: string;
    amount: number;
    quantity: number;
  }[];
  sellTransactions: {
    type: string;
    pair: string;
    amount: number;
    quantity: number;
  }[];
}
