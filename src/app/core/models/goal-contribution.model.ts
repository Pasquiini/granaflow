export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  note?: string | null;
  created_at: string;
}
