export type CategoryKind = 'expense' | 'income';
export interface Category {
  id: string;
  user_id: string;
  name: string;
  kind: CategoryKind;
  parent_id?: string | null;
  icon?: string | null;
  color?: string | null;
  created_at: string;
}
