export interface IJobData {
  id: number;
  name: string;
  type: "SCHEDULE" | "MANUAL";
  cron_schedule?: string;
  is_active: boolean;
  last_run_at: string;
  next_run_at?: string;
}
