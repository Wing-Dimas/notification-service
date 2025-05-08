import { NextFunction, Request, Response } from "express";
import JobService from "@/services/job.service";
import { ReloadJobDTO, StartJobDTO, StopJobDTO } from "@/dtos/job.dto";

class JobController {
  public jobService = new JobService();

  public getJobs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const jobs = await this.jobService.findAllJob();
      res
        .status(200)
        .json({ status: 200, message: "get all jobs success", data: jobs });
    } catch (error) {
      next(error);
    }
  };

  public startJob = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name } = req.body as StartJobDTO;
      await this.jobService.startJob(name);
      res
        .status(200)
        .json({ status: 200, message: "start job success", data: null });
    } catch (error) {
      next(error);
    }
  };

  public stopJob = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name } = req.body as StopJobDTO;
      await this.jobService.stopJob(name);
      res
        .status(200)
        .json({ status: 200, message: "stop job success", data: null });
    } catch (error) {
      next(error);
    }
  };

  public reloadJob = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { name } = req.body as ReloadJobDTO;
      await this.jobService.reloadJob(name);
      res
        .status(200)
        .json({ status: 200, message: "reload job success", data: null });
    } catch (error) {
      next(error);
    }
  };
}

export default JobController;
