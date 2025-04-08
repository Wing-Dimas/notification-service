export interface Content extends Object {
  receiver?: string | null;
  message?: string | null;
  data?: string | null;
  filename?: string | null;
}

export interface Headers {
  mime_type: string;
  [key: string]: string;
}
