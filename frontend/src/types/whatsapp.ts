export interface HistoryMessageWA {
  id: number;
  payload: string;
  status: boolean;
  filename?: string;
  mime_type?: string;
  file_path?: string;
  created_at?: string;
  updated_at?: string;
  sent_at?: string;
  deleted_at?: string;
}
