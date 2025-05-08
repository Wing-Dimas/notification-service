import { Router } from "express";

import { Routes } from "@interfaces/routes.interface";
import validationMiddleware from "@middlewares/validation.middleware";
import JobController from "@/controllers/job.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { ReloadJobDTO, StartJobDTO, StopJobDTO } from "@/dtos/job.dto";

class JobRoute implements Routes {
  public path = "/api/job";
  public router = Router();
  public usersController = new JobController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET ALL JOBS
    this.router.get(
      `${this.path}`,
      authMiddleware,
      this.usersController.getJobs,
    );

    // START JOB
    this.router.put(
      `${this.path}/start`,
      validationMiddleware(StartJobDTO, "body"),
      this.usersController.startJob,
    );

    // STOP JOB
    this.router.put(
      `${this.path}/stop`,
      validationMiddleware(StopJobDTO, "body"),
      this.usersController.stopJob,
    );

    // RELOAD JOB
    this.router.put(
      `${this.path}/reload`,
      validationMiddleware(ReloadJobDTO, "body"),
      this.usersController.reloadJob,
    );
  }
}

export default JobRoute;
