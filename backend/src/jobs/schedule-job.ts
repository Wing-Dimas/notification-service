import cron from "node-cron";
import parser from "cron-parser";
import BaseJob from "./base-job";
import { logger } from "@/utils/logger";

export default class ScheduledJob extends BaseJob {
  private cronSchedule: string;
  private cronTask: cron.ScheduledTask | null;

  /**
   * Constructs a new instance of the ScheduledJob class.
   *
   * @param jobName - The name of the job.
   * @param cronSchedule - The cron schedule string defining the job's schedule.
   */
  constructor(jobName: string, cronSchedule: string) {
    super(jobName, "SCHEDULE");
    this.cronSchedule = cronSchedule;
    this.cronTask = null; // * * * * * *
  }

  /**
   * Starts the scheduled job by initiating the cron task.
   * If a cron task is already running, it stops it first.
   * Updates the job data with the current schedule and sets it as active.
   * Schedules the cron task with the specified cron schedule.
   * On each scheduled run, it calculates the next run time,
   * updates the database with the current and next run times,
   * executes the job, and logs the execution status.
   * Logs a success message if the execution succeeds, otherwise logs an error message.
   */
  public async start(): Promise<void> {
    if (this.cronTask) this.stop();

    this.updateJobData({ cron_schedule: this.cronSchedule, is_active: true });

    this.cronTask = cron.schedule(this.cronSchedule, async () => {
      try {
        const now = new Date();

        // Hitung next run
        const interval = parser.parse(this.cronSchedule, { currentDate: now });
        const nextRun = interval.next().toDate();
        await this.updateJobData({ next_run_at: nextRun, last_run_at: now });

        await this.execute();
        await this.logExecution("success");
      } catch (error) {
        await this.logExecution("failed", error.message);
        throw error;
      }
    });

    logger.info(
      `[ScheduledJob] ${this.jobName} started with schedule: ${this.cronSchedule}`,
    );
  }

  /**
   * Stops the scheduled job and performs any necessary cleanup.
   * This method is called when a job is stopped.
   * If a cron task is running, it stops it first.
   * Updates the job data with the current schedule and sets it as inactive.
   * Logs a success message if the execution succeeds, otherwise logs an error message.
   */
  public async stop(): Promise<void> {
    try {
      await this.updateJobData({ is_active: false, next_run_at: null });
      logger.info(`[ScheduledJob] ${this.jobName} stopped`);
      if (this.cronTask) this.cronTask.stop();
    } catch (error) {
      throw error;
    }
  }
}
