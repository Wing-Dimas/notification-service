import { NextFunction, Request, Response } from "express";
import {
  DeleteMessageTelegramDto,
  GetMessageTelegramDto,
  GetSingleMessageTelegramDto,
  SendMessageTelegramDto,
} from "@/dtos/telegram.dto";
import TelegramService from "@/services/telegram.service";

class TelegramController {
  public telegramService = new TelegramService();

  public getMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: GetMessageTelegramDto = req.query;
      const result = await this.telegramService.getMessage(query);

      res.status(200).json({ message: "success", status: 200, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getSingleMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params: GetSingleMessageTelegramDto = req.params as any;

      const result = await this.telegramService.getSingleMessage(params);

      res.status(200).json({ message: "success", status: 200, data: result });
    } catch (error) {
      next(error);
    }
  };

  public editMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body as { message: string; receiver: string };
      const id = Number(req.params.id);
      const file = req.file;

      const message = await this.telegramService.editMessage(id, body, file);

      res.status(200).json({ message: "success", status: 200, data: message });
    } catch (error) {
      next(error);
    }
  };

  public deleteMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params: DeleteMessageTelegramDto = req.params as any;

      const message = await this.telegramService.deleteMessage(params);

      res.status(200).json({ message: "success", status: 200, data: message });
    } catch (error) {
      next(error);
    }
  };

  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const params: SendMessageTelegramDto = req.params as any;

      const message = await this.telegramService.sendMessage(params);

      res.status(200).json({ message: "success", status: 200, data: message });
    } catch (error) {
      next(error);
    }
  };
}

export default TelegramController;
