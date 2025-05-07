import { logger } from "@/utils/logger";
import BaseJob from "./base-job";

export default class ManualJob extends BaseJob {
  /**
   * Constructs a new instance of the ManualJob class.
   *
   * @param jobName - The name of the job.
   */
  constructor(jobName = "") {
    super(jobName, "MANUAL");
  }

  /**
   * Starts the job and initiates its execution.
   * This method is called to begin the job process and should be overridden
   * with the specific logic to start the job.
   * Logs a success message if the execution succeeds, otherwise logs an error message.
   */
  public async start() {
    try {
      await this.updateJobData({ is_active: true, last_run_at: new Date() });
      await this.execute();
      await this.logExecution("success");
    } catch (error) {
      await this.logExecution("failed", error.message);
      throw error;
    }
  }

  protected async onStop() {
    // This method should be overridden
  }

  /**
   * Stops the job and performs any necessary cleanup.
   * This method is called when a job is stopped.
   */
  public async stop(): Promise<void> {
    try {
      await this.updateJobData({ is_active: false });
      await this.onStop();
      logger.info(`${this.jobName} stopped`);
    } catch (error) {
      throw error;
    }
  }
}
