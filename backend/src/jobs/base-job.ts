import { db } from "@/libs/db";
import { logger } from "@/utils/logger";
import { Prisma } from "@prisma/client";

type JobType = Partial<Prisma.JobCreateInput>;

export default class BaseJob {
  private jobModel = db.job;
  protected jobName: string;
  protected type: JobType["type"];

  /**
   * Constructs a new instance of the BaseJob class.
   *
   * @param jobName - The name of the job.
   * @param type - The type of the job.
   */
  constructor(jobName = "", type: JobType["type"]) {
    this.jobName = jobName;
    this.type = type;
  }

  /**
   * Updates the job data in the database. If the job does not exist, it is created.
   *
   * @param data - The data to update the job with.
   */
  public async updateJobData(data: JobType) {
    await this.jobModel.upsert({
      where: { name: this.jobName },
      update: { ...data },
      create: { name: this.jobName, type: this.type, ...data },
    });
  }

  /**
   * Logs the execution status of the job.
   *
   * @param status - The status of the job execution, either "success" or "failed".
   * @param message - An optional message providing additional details about the execution.
   */
  public async logExecution(status: "success" | "failed", message?: string) {
    logger.info(`Job ${this.jobName} ${status} : ${message || ""}`);
  }

  /**
   * Executes the job logic.
   * This method is called when a job is started.
   * Override this method to add your own code for executing the job.
   * @throws {Error} if the method is not implemented
   */
  protected async execute() {
    throw new Error("Method execute() must be implemented!");
  }

  /**
   * Starts the job and initiates its execution.
   * This method is called to begin the job process and should be overridden
   * with the specific logic to start the job.
   * @throws {Error} if the method is not implemented
   */
  public async start(): Promise<void> {
    throw new Error("Method start() must be implemented!");
  }

  /**
   * Stops the job and performs any necessary cleanup.
   * This method is called when a job is stopped.
   * Override this method to add your own code for stopping the job.
   */
  public async stop(): Promise<void> {
    // This method should be overridden
  }

  /**
   * Gets the name of the job.
   * @returns The name of the job.
   */
  public getJobName() {
    return this.jobName;
  }

  /**
   * Retrieves the job data from the database.
   *
   * @returns The job data from the database, or null if the job does not exist.
   */
  public async getJob() {
    return await this.jobModel.findUnique({ where: { name: this.jobName } });
  }
}
