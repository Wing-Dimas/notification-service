import ManualJob from "./manual-job";
import BaseJob from "./base-job";
import { JobClass, jobs } from "./jobs";
import { logger } from "@/utils/logger";
import { db } from "@/libs/db";

class JobManager {
  private static readonly jobs: BaseJob[] = [];
  private static jobClass: JobClass[] = jobs;
  private static jobModel = db.job;
  private static isInitialized = false;

  /**
   * Initializes the JobManager by registering core jobs, starting them, and
   * removing any jobs from the database that do not exist in the current job list.
   * Throws an error if the JobManager is already initialized.
   * This method should be called once to set up the job environment.
   */
  public static async init() {
    if (this.isInitialized)
      throw new Error("JobManager is already initialized");

    try {
      await this.registerCoreJobs();
      await this.startJobs();
      await this.removeJobsIsNotExistInDB();

      this.isInitialized = true;
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * Registers all core jobs in the database. This includes both manual and scheduled
   * jobs. The job type is determined by the job class (ManualJob or ScheduledJob)
   * and the job name is retrieved from the job instance.
   * The job data is updated in the database with the job type and name.
   * Logs an info message for each job that is registered.
   */
  private static async registerCoreJobs() {
    for (const Job of this.jobClass) {
      const instance = new Job();
      await instance.updateJobData({
        type: instance instanceof ManualJob ? "MANUAL" : "SCHEDULE",
        name: instance.getJobName(),
      });
      this.jobs.push(instance);
      logger.info(`Job ${instance.getJobName()} has been registered`);
    }
  }

  /**
   * Starts all jobs in the JobManager. Scheduled jobs are started if they are active
   * and manual jobs are started if they are active. This method is called by init()
   * to set up the job environment.
   */
  private static async startJobs() {
    this.jobs.forEach(async job => {
      const jobData = await job.getJob();
      if (jobData.is_active) {
        job.start();
        job.isActive = true;
      }
    });
  }

  /**
   * Removes jobs from the database that do not exist in the current list of jobs.
   * This is determined by comparing the job names in the database with those in the JobManager.
   * Any job in the database with a name not present in the JobManager's job list will be deleted.
   */
  private static async removeJobsIsNotExistInDB() {
    await this.jobModel.deleteMany({
      where: { NOT: { name: { in: this.jobs.map(job => job.getJobName()) } } },
    });
  }

  /**
   * Starts a job with the given name. If the job does not exist, the method
   * returns false. Otherwise, the job is started and the method returns true.
   * @param name - The name of the job to start.
   * @returns A boolean indicating whether the job was started successfully.
   */
  public static async startJob(name: string): Promise<boolean> {
    try {
      const job = this.jobs.find(job => job.getJobName() === name);
      if (!job) return false;

      await job.start();

      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  /**
   * Stops a job with the given name. If the job does not exist, the method
   * returns false. Otherwise, the job is stopped and the method returns true.
   * @param name - The name of the job to stop.
   * @returns A boolean indicating whether the job was stopped successfully.
   */
  public static async stopJob(name: string): Promise<boolean> {
    try {
      const job = this.jobs.find(job => job.getJobName() === name);
      if (!job) return false;

      await job.stop();

      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  /**
   * Reloads a job with the given name by stopping it and starting it again.
   * If the job does not exist, the method returns false.
   * Otherwise, the job is reloaded and the method returns true.
   * @param name - The name of the job to reload.
   * @returns A boolean indicating whether the job was reloaded successfully.
   */
  public static async reloadJob(name: string): Promise<boolean> {
    try {
      const job = this.jobs.find(job => job.getJobName() === name);
      if (!job) return false;

      await job.stop();
      await job.start();
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  /**
   * Checks if a job with the given name exists.
   * @param name - The name of the job to check.
   * @returns A boolean indicating whether the job exists.
   */
  public static isExist(name: string): boolean {
    return this.jobs.some(job => job.getJobName() === name);
  }
}

export default JobManager;
