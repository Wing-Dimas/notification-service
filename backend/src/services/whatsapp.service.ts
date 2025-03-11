import {
  EditMessageWADto,
  GetMessageWADto,
  GetSingleMessageWADto,
} from "@/dtos/whatsapp.dto";
import { HttpException } from "@/exceptions/HttpException";
import { db } from "@/libs/db";
import { validateJson } from "@/utils/utils";
import { HistoryMessageWA, Prisma } from "@prisma/client";
import { isEmpty } from "class-validator";
import path from "path";
import fs from "fs";
// import { ConnectionSession } from "@/libs/whatsapp";
import { createPaginator, PaginatedResult } from "prisma-pagination";

class WhatsappService {
  public historyMessage = db.historyMessageWA;
  public paginator = createPaginator({ perPage: 10 });

  public async getMessage(
    query: GetMessageWADto,
  ): Promise<PaginatedResult<HistoryMessageWA>> {
    const search = query.search?.toLowerCase() || "";
    const page = query.page || 1;
    const order_by = query.order_by || "created_at";
    const sort = query.sort || "desc";

    const result = await this.paginator<
      HistoryMessageWA,
      Prisma.HistoryMessageWAFindManyArgs
    >(
      this.historyMessage,
      {
        orderBy: { [order_by]: sort },
        where: { payload: { contains: search } },
      },
      { page: page },
    );

    return result;
  }

  public async getSingleMessage(
    params: GetSingleMessageWADto,
  ): Promise<HistoryMessageWA> {
    if (isNaN(Number(params.id)))
      throw new HttpException(400, "Id is not number");
    const findMessage = await this.historyMessage.findUnique({
      where: { id: Number(params.id) },
    });
    if (!findMessage) throw new HttpException(409, "Message dosent exist");
    return findMessage;
  }

  public async editMessage(
    id: number,
    messageData: EditMessageWADto,
    file?: Express.Multer.File,
  ) {
    if (isEmpty(messageData))
      throw new HttpException(400, "message data is empty");

    const findMessage = await this.historyMessage.findUnique({
      where: { id },
    });

    if (!findMessage) throw new HttpException(409, "Message dosent exist");

    const payload = findMessage.payload;
    const isJson = validateJson(payload);

    const updatedPayload = isJson ? JSON.parse(findMessage.payload) : {};
    updatedPayload.message = messageData.message;
    updatedPayload.data = null;

    const data: any = {
      payload: JSON.stringify(updatedPayload),
    };

    if (file) {
      const tempFile = findMessage.file_path;
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

      updatedPayload.filename = file.filename;
      data.file_path = "/" + file.path.split(path.sep).join("/"); // replace "\\" to /
      data.mime_type = file.mimetype;
      data.filename = file.filename;
      data.payload = JSON.stringify(updatedPayload);
    }

    return await this.historyMessage.update({
      where: { id },
      data: data,
    });
  }
}

export default WhatsappService;
