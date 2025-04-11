import MessageService from "@/services/message.service";
import { NextFunction, Request, Response } from "express";

class IndexController {
  public messageService = new MessageService();

  public index = (req: Request, res: Response, next: NextFunction): void => {
    try {
      res.send("Hello world");
    } catch (error) {
      next(error);
    }
  };

  public getDashboardData = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const [total, weaklyData, messages, dailyStatusMessage] =
        await Promise.all([
          this.messageService.getTotalMessage(),
          this.messageService.getWeeklyData(),
          this.messageService.getMessage(),
          this.messageService.getDailyStatusMessage(),
        ]);

      res.status(200).json({
        message: "success",
        status: 200,
        data: { total, messages, weaklyData, dailyStatusMessage },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default IndexController;
