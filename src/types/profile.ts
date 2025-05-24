export interface Profile {
  id: string;
  avatar_id: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | null | undefined;
}
