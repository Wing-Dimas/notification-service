import { HttpException } from "@exceptions/HttpException";
import { db } from "@/libs/db";
import { Job } from "@prisma/client";
import JobManager from "@/jobs/job-manager";

class JobService {
  public job = db.job;

  public async findAllJob(): Promise<Job[]> {
    const allJob = await this.job.findMany();
    return allJob;
  }

  public async startJob(name: string): Promise<void> {
    const isExist = JobManager.isExist(name);

    if (!isExist) throw new HttpException(409, "Job doesn't exist");

    await JobManager.startJob(name);
  }

  public async stopJob(name: string): Promise<void> {
    const isExist = JobManager.isExist(name);

    if (!isExist) throw new HttpException(409, "Job doesn't exist");

    await JobManager.stopJob(name);
  }

  public async reloadJob(name: string): Promise<void> {
    const isExist = JobManager.isExist(name);

    if (!isExist) throw new HttpException(409, "Job doesn't exist");

    await JobManager.reloadJob(name);
  }
}

export default JobService;
