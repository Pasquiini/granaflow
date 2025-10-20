export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;           // 'YYYY-MM-01'
  limit_amount: number;
  created_at: string;
}

export interface BudgetStatus {
  id: string;
  category_id: string;
  month: string;           // 'YYYY-MM-01'
  limit_amount: number;
  spent: number;
  progress_ratio: number;  // 0..N (pode passar de 1)
}
