export type GoalStatus = 'active' | 'done' | 'overdue';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  target_amount: number;
  current_amount: number;
  due_date?: string | null;   // ISO yyyy-mm-dd
  category?: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}
