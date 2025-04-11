import { NextFunction, Request, Response } from "express";
import MessageService from "@/services/message.service";

class MessageController {
  public messageService = new MessageService();

  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res.status(200).json({ message: "success" });
    } catch (error) {
      next(error);
    }
  };
}

export default MessageController;
