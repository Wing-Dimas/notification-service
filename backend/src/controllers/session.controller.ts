import { NextFunction, Request, Response } from "express";
import SessionService from "@/services/session.service";

class SessionController {
  public sessionService = new SessionService();

  // public createSession = async (
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> => {
  //   try {
  //     await this.sessionService.createNewSession();
  //     res.status(201).json({
  //       message: "success",
  //       status: 201,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  public getStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const status = await this.sessionService.getStatus();
      res.status(200).json({
        message: "success",
        status: 200,
        data: {
          status,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default SessionController;
