export type AccountType = 'cash' | 'checking' | 'savings' | 'credit';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  created_at: string;
}
