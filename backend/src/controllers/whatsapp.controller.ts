import { NextFunction, Request, Response } from "express";
import WhatsappService from "@/services/whatsapp.service";
import {
  DeleteMessageWADto,
  GetMessageWADto,
  GetSingleMessageWADto,
  SendMessageWADto,
} from "@/dtos/whatsapp.dto";

class WhatsappController {
  public whatsappService = new WhatsappService();

  public getMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query: GetMessageWADto = req.query;
      const result = await this.whatsappService.getMessage(query);

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
      const params: GetSingleMessageWADto = req.params as any;

      const result = await this.whatsappService.getSingleMessage(params);

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
      const messageData = req.body.message as string;
      const id = Number(req.params.id);
      const file = req.file;

      const message = await this.whatsappService.editMessage(
        id,
        messageData,
        file,
      );

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
      const params: DeleteMessageWADto = req.params as any;

      const message = await this.whatsappService.deleteMessage(params);

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
      const params: SendMessageWADto = req.params as any;

      const message = await this.whatsappService.sendMessage(params);

      res.status(200).json({ message: "success", status: 200, data: message });
    } catch (error) {
      next(error);
    }
  };
}

export default WhatsappController;
