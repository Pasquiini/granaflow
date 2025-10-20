export type TxnType = 'expense' | 'income' | 'transfer';


export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string | null;
  type: TxnType;
  amount: number;
  occurred_at: string; // ISO date (YYYY-MM-DD)
  description?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  transfer_account_id?: string | null;
  created_at: string;
}
export interface TransactionWithRelations extends Transaction {
  account?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
}
