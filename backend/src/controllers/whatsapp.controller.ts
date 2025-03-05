import { NextFunction, Request, Response } from "express";
import WhatsappService from "@/services/whatsapp.service";
import { GetMessageDto } from "@/dtos/whatsapp.dto";

class WhatsappController {
  public whatsappService = new WhatsappService();

  //   public sendMessage = async (
  //     req: Request,
  //     res: Response,
  //     next: NextFunction,
  //   ): Promise<void> => {
  //     try {
  //       await this.messageService.sendMessage(req.body);
  //       res.status(200).json({ message: "success" });
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  public getMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = req.query as GetMessageDto;
      const result = await this.whatsappService.getMessage(query);

      res.status(200).json({ message: "success", status: 200, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default WhatsappController;
