export interface IApiKeyData {
  id: number;
  name: string;
  key: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
export interface IApiKeyCreate {
  name: string;
}

export interface IApiKeyUpdate {
  name: string;
  is_active: boolean;
}
