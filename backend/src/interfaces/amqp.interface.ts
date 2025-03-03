export interface Content extends Object {
  message?: string | null;
  data?: string | null;
  filename?: string | null;
}

export interface Headers {
  mime_type: string;
  [key: string]: string;
}
