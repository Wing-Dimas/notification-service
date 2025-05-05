import { NextFunction, Request, Response } from "express";
import MessageService from "@/services/message.service";
import { SendMessageDto } from "@/dtos/message.dto";

class MessageController {
  public messageService = new MessageService();

  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const messageData = req.body as SendMessageDto;
      const file = req.file as Express.Multer.File;

      await this.messageService.sendMessage(messageData, file);

      res.status(200).json({ message: "success", status: 200 });
    } catch (error) {
      next(error);
    }
  };
}

export default MessageController;
